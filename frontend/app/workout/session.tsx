import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Vibration,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useWorkoutStore, Workout, WorkoutExercise } from '../../src/store/workoutStore';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ExerciseAnimation } from '../../src/components/ExerciseAnimation';
import * as Speech from 'expo-speech';

interface SetProgress {
  completed: boolean;
  actualReps: number;
  actualWeight: number;
}

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const { sessionId, workoutId } = useLocalSearchParams<{ sessionId: string; workoutId: string }>();
  const { token } = useAuthStore();
  const { workouts, currentSession, completeSession, logRepFailure, logAdjustment } = useWorkoutStore();

  const workout = workouts.find((w) => w.id === workoutId);
  const exercises = workout?.exercises || [];

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureReps, setFailureReps] = useState(0);
  const [setsProgress, setSetsProgress] = useState<SetProgress[][]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentExercise = exercises[currentExerciseIndex];

  // Initialize sets progress
  useEffect(() => {
    if (exercises.length > 0) {
      const initialProgress = exercises.map((ex) =>
        Array(ex.sets).fill(null).map(() => ({
          completed: false,
          actualReps: ex.reps,
          actualWeight: ex.weight || 0,
        }))
      );
      setSetsProgress(initialProgress);
    }
  }, [exercises]);

  // Elapsed time timer
  useEffect(() => {
    elapsedTimerRef.current = setInterval(() => {
      if (!isPaused) {
        setElapsedTime((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [isPaused]);

  // Rest timer
  useEffect(() => {
    if (isResting && restTime > 0 && !isPaused) {
      restTimerRef.current = setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            Vibration.vibrate(500);
            if (voiceEnabled) {
              Speech.speak('Rest complete. Get ready for your next set.', { rate: 0.9 });
            }
            return 0;
          }
          // Countdown voice
          if (voiceEnabled && prev <= 5) {
            Speech.speak(String(prev - 1), { rate: 1.2 });
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [isResting, isPaused, voiceEnabled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    if (!currentExercise) return;

    // Mark set as complete
    const newProgress = [...setsProgress];
    if (newProgress[currentExerciseIndex]) {
      newProgress[currentExerciseIndex][currentSetIndex].completed = true;
    }
    setSetsProgress(newProgress);

    if (voiceEnabled) {
      Speech.speak('Set complete! Good work.', { rate: 0.9 });
    }

    // Move to next set or exercise
    if (currentSetIndex < currentExercise.sets - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
      setIsResting(true);
      setRestTime(currentExercise.rest_seconds);
    } else if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      setIsResting(true);
      setRestTime(currentExercise.rest_seconds);
    } else {
      // Workout complete
      handleCompleteWorkout();
    }
  };

  const handleRepFailure = () => {
    setShowFailureModal(true);
    setFailureReps(currentExercise?.reps || 0);
    setIsPaused(true);
  };

  const submitRepFailure = async () => {
    if (!token || !sessionId || !currentExercise) return;

    try {
      await logRepFailure(token, sessionId, {
        exercise_name: currentExercise.exercise_name,
        weight: currentExercise.weight || 0,
        target_reps: currentExercise.reps,
        completed_reps: failureReps,
        set_number: currentSetIndex + 1,
      });

      if (voiceEnabled) {
        Speech.speak('Rep failure logged. Take your time.', { rate: 0.9 });
      }
    } catch (error) {
      console.error('Failed to log rep failure:', error);
    }

    setShowFailureModal(false);
    setIsPaused(false);
  };

  const handleAdjustWorkout = async (reason: string) => {
    if (!token || !sessionId) return;

    try {
      await logAdjustment(token, sessionId, {
        reason,
        exercise_name: currentExercise?.exercise_name,
      });

      Alert.alert(
        'Workout Adjusted',
        'Your feedback has been recorded. Future workouts will be adapted based on this.'
      );
    } catch (error) {
      console.error('Failed to log adjustment:', error);
    }

    setShowAdjustModal(false);
  };

  const handleCompleteWorkout = async () => {
    if (!token || !sessionId) return;

    Alert.alert(
      'Complete Workout',
      'Great job! Are you ready to finish this workout?',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await completeSession(token, sessionId);
              if (voiceEnabled) {
                Speech.speak('Congratulations! Workout complete!', { rate: 0.9 });
              }
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Failed to complete session:', error);
            }
          },
        },
      ]
    );
  };

  const handleEndWorkout = () => {
    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout early?',
      [
        { text: 'Continue', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: async () => {
            if (token && sessionId) {
              await completeSession(token, sessionId);
            }
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTime(0);
  };

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSets = setsProgress.flat().filter((s) => s?.completed).length;
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  if (!workout || !currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleEndWorkout}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.elapsedTimer}>
          <Ionicons name="time-outline" size={16} color="#888" />
          <Text style={styles.elapsedTimeText}>{formatTime(elapsedTime)}</Text>
        </View>
        <TouchableOpacity onPress={() => setVoiceEnabled(!voiceEnabled)}>
          <Ionicons
            name={voiceEnabled ? 'volume-high' : 'volume-mute'}
            size={24}
            color={voiceEnabled ? '#FF6B35' : '#666'}
          />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completedSets}/{totalSets} sets
        </Text>
      </View>

      {isResting ? (
        /* Rest Screen */
        <View style={styles.restContainer}>
          <View style={styles.restContent}>
            <Ionicons name="bed-outline" size={64} color="#4ECDC4" />
            <Text style={styles.restTitle}>Rest Time</Text>
            <Text style={styles.restTimer}>{formatTime(restTime)}</Text>
            <Text style={styles.nextExercise}>
              Next: Set {currentSetIndex + 1} of {currentExercise.exercise_name}
            </Text>
            <Button
              title="Skip Rest"
              onPress={skipRest}
              variant="outline"
              style={styles.skipButton}
            />
          </View>
        </View>
      ) : (
        /* Exercise Screen */
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.exerciseSection}>
            <Text style={styles.exerciseCount}>
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </Text>
            <Text style={styles.exerciseName}>{currentExercise.exercise_name}</Text>

            {/* Exercise Animation - Start and End positions */}
            <View style={styles.animationContainer}>
              <View style={styles.animationBox}>
                <ExerciseAnimation 
                  exerciseName={currentExercise.exercise_name} 
                  position="start" 
                  size={70}
                />
                <Text style={styles.animationLabel}>START</Text>
              </View>
              <View style={styles.animationArrow}>
                <Ionicons name="arrow-forward" size={24} color="#39FF14" />
              </View>
              <View style={styles.animationBox}>
                <ExerciseAnimation 
                  exerciseName={currentExercise.exercise_name} 
                  position="end" 
                  size={70}
                />
                <Text style={styles.animationLabel}>END</Text>
              </View>
            </View>

            <View style={styles.setInfo}>
              <View style={styles.setCircle}>
                <Text style={styles.setNumber}>{currentSetIndex + 1}</Text>
                <Text style={styles.setLabel}>of {currentExercise.sets}</Text>
              </View>
            </View>

            <View style={styles.targetInfo}>
              <View style={styles.targetItem}>
                <Text style={styles.targetValue}>{currentExercise.reps}</Text>
                <Text style={styles.targetLabel}>Reps</Text>
              </View>
              {currentExercise.weight && (
                <View style={styles.targetItem}>
                  <Text style={styles.targetValue}>{currentExercise.weight}</Text>
                  <Text style={styles.targetLabel}>kg</Text>
                </View>
              )}
            </View>

            {currentExercise.notes && (
              <View style={styles.notesBox}>
                <Ionicons name="information-circle" size={18} color="#4ECDC4" />
                <Text style={styles.notesText}>{currentExercise.notes}</Text>
              </View>
            )}
          </View>

          {/* Sets Progress */}
          <View style={styles.setsProgressContainer}>
            <Text style={styles.setsTitle}>Sets</Text>
            <View style={styles.setsRow}>
              {Array(currentExercise.sets)
                .fill(null)
                .map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.setDot,
                      setsProgress[currentExerciseIndex]?.[i]?.completed && styles.setDotComplete,
                      i === currentSetIndex && !setsProgress[currentExerciseIndex]?.[i]?.completed && styles.setDotCurrent,
                    ]}
                  >
                    {setsProgress[currentExerciseIndex]?.[i]?.completed && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                    {i === currentSetIndex && !setsProgress[currentExerciseIndex]?.[i]?.completed && (
                      <Text style={styles.setDotText}>{i + 1}</Text>
                    )}
                  </View>
                ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Bottom Actions */}
      {!isResting && (
        <View style={styles.bottomActions}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowAdjustModal(true)}
            >
              <Ionicons name="options-outline" size={24} color="#FFE66D" />
              <Text style={styles.actionButtonText}>Adjust</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRepFailure}
            >
              <Ionicons name="alert-circle-outline" size={24} color="#FF6B6B" />
              <Text style={styles.actionButtonText}>Rep Fail</Text>
            </TouchableOpacity>
          </View>
          <Button
            title="Complete Set"
            onPress={handleCompleteSet}
            size="large"
            icon={<Ionicons name="checkmark" size={24} color="#fff" />}
          />
        </View>
      )}

      {/* Adjust Modal */}
      <Modal
        visible={showAdjustModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAdjustModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adjust Workout</Text>
            <Text style={styles.modalSubtitle}>How are you feeling?</Text>

            <TouchableOpacity
              style={styles.adjustOption}
              onPress={() => handleAdjustWorkout('too_tough')}
            >
              <Ionicons name="fitness-outline" size={24} color="#FF6B6B" />
              <View>
                <Text style={styles.adjustOptionTitle}>Too Tough</Text>
                <Text style={styles.adjustOptionDesc}>Reduce overall intensity</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adjustOption}
              onPress={() => handleAdjustWorkout('too_heavy')}
            >
              <Ionicons name="barbell-outline" size={24} color="#FFE66D" />
              <View>
                <Text style={styles.adjustOptionTitle}>Too Heavy</Text>
                <Text style={styles.adjustOptionDesc}>Lower the weight</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adjustOption}
              onPress={() => handleAdjustWorkout('too_fast')}
            >
              <Ionicons name="speedometer-outline" size={24} color="#4ECDC4" />
              <View>
                <Text style={styles.adjustOptionTitle}>Too Fast</Text>
                <Text style={styles.adjustOptionDesc}>Need more rest time</Text>
              </View>
            </TouchableOpacity>

            <Button
              title="Cancel"
              onPress={() => setShowAdjustModal(false)}
              variant="secondary"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>

      {/* Rep Failure Modal */}
      <Modal
        visible={showFailureModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowFailureModal(false);
          setIsPaused(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rep Failure</Text>
            <Text style={styles.modalSubtitle}>How many reps did you complete?</Text>

            <View style={styles.repCounter}>
              <TouchableOpacity
                style={styles.repButton}
                onPress={() => setFailureReps(Math.max(0, failureReps - 1))}
              >
                <Ionicons name="remove" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.repValue}>{failureReps}</Text>
              <TouchableOpacity
                style={styles.repButton}
                onPress={() => setFailureReps(failureReps + 1)}
              >
                <Ionicons name="add" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.repTarget}>
              Target was {currentExercise?.reps} reps
            </Text>

            <Button
              title="Log Failure"
              onPress={submitRepFailure}
              style={styles.logButton}
            />
            <Button
              title="Cancel"
              onPress={() => {
                setShowFailureModal(false);
                setIsPaused(false);
              }}
              variant="secondary"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  elapsedTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  elapsedTimeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  progressText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  restContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  restContent: {
    alignItems: 'center',
  },
  restTitle: {
    color: '#4ECDC4',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
  },
  restTimer: {
    color: '#fff',
    fontSize: 72,
    fontWeight: '700',
    marginVertical: 20,
  },
  nextExercise: {
    color: '#888',
    fontSize: 16,
    marginBottom: 30,
  },
  skipButton: {
    paddingHorizontal: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 200,
  },
  exerciseSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  exerciseCount: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  animationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  animationBox: {
    alignItems: 'center',
  },
  animationArrow: {
    paddingHorizontal: 8,
  },
  animationLabel: {
    color: '#39FF14',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 1,
  },
  setInfo: {
    marginBottom: 32,
  },
  setCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumber: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '700',
  },
  setLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  targetInfo: {
    flexDirection: 'row',
    gap: 40,
  },
  targetItem: {
    alignItems: 'center',
  },
  targetValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  targetLabel: {
    color: '#888',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginTop: 24,
    maxWidth: '100%',
  },
  notesText: {
    color: '#4ECDC4',
    fontSize: 14,
    flex: 1,
  },
  setsProgressContainer: {
    marginBottom: 20,
  },
  setsTitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  setsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  setDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setDotComplete: {
    backgroundColor: '#4ECDC4',
  },
  setDotCurrent: {
    backgroundColor: '#FF6B35',
  },
  setDotText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    color: '#888',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  adjustOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  adjustOptionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  adjustOptionDesc: {
    color: '#888',
    fontSize: 13,
  },
  cancelButton: {
    marginTop: 12,
  },
  repCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    marginVertical: 24,
  },
  repButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
    minWidth: 80,
    textAlign: 'center',
  },
  repTarget: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  logButton: {
    marginBottom: 12,
  },
});
