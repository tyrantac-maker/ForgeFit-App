import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';
import { BodyAnatomy } from '../../src/components/BodyAnatomy';
import ForgeVideoBackground from '../../src/components/ForgeVideoBackground';

// Muscle groups organized by body region
const MUSCLE_GROUPS = {
  upper_front: [
    { id: 'chest', label: 'Chest', icon: 'fitness-outline' },
    { id: 'shoulders', label: 'Shoulders', icon: 'body-outline' },
    { id: 'biceps', label: 'Biceps', icon: 'barbell-outline' },
    { id: 'forearms', label: 'Forearms', icon: 'hand-left-outline' },
    { id: 'abs', label: 'Abs', icon: 'cellular-outline' },
    { id: 'obliques', label: 'Obliques', icon: 'swap-horizontal-outline' },
  ],
  upper_back: [
    { id: 'traps', label: 'Traps', icon: 'triangle-outline' },
    { id: 'lats', label: 'Lats', icon: 'expand-outline' },
    { id: 'upper_back', label: 'Upper Back', icon: 'chevron-up-outline' },
    { id: 'lower_back', label: 'Lower Back', icon: 'chevron-down-outline' },
    { id: 'triceps', label: 'Triceps', icon: 'barbell-outline' },
  ],
  lower: [
    { id: 'glutes', label: 'Glutes', icon: 'ellipse-outline' },
    { id: 'quads', label: 'Quads', icon: 'arrow-up-outline' },
    { id: 'hamstrings', label: 'Hamstrings', icon: 'arrow-down-outline' },
    { id: 'calves', label: 'Calves', icon: 'footsteps-outline' },
  ],
  grip: [
    { id: 'wrists', label: 'Wrists', icon: 'sync-outline' },
    { id: 'grip', label: 'Grip', icon: 'hand-right-outline' },
  ],
};

const ALL_MUSCLES = [
  ...MUSCLE_GROUPS.upper_front,
  ...MUSCLE_GROUPS.upper_back,
  ...MUSCLE_GROUPS.lower,
  ...MUSCLE_GROUPS.grip,
];

const WORKOUT_SPLITS = [
  { 
    id: 'full_body', 
    label: 'Full Body', 
    description: '2-3 days per week, hit all muscles each session',
    defaultDays: 3,
    presetMuscles: {
      1: ['chest', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'abs'],
      2: ['chest', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'abs'],
      3: ['chest', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'abs'],
    }
  },
  { 
    id: 'upper_lower', 
    label: 'Upper/Lower', 
    description: '4 days per week, alternate upper and lower body',
    defaultDays: 4,
    presetMuscles: {
      1: ['chest', 'shoulders', 'biceps', 'triceps', 'traps', 'lats', 'abs'],
      2: ['quads', 'hamstrings', 'glutes', 'calves', 'lower_back'],
      3: ['chest', 'shoulders', 'biceps', 'triceps', 'upper_back', 'abs'],
      4: ['quads', 'hamstrings', 'glutes', 'calves', 'lower_back'],
    }
  },
  { 
    id: 'push_pull_legs', 
    label: 'Push/Pull/Legs', 
    description: '3-6 days per week, organized by movement pattern',
    defaultDays: 6,
    presetMuscles: {
      1: ['chest', 'shoulders', 'triceps'],
      2: ['lats', 'traps', 'upper_back', 'biceps', 'forearms'],
      3: ['quads', 'hamstrings', 'glutes', 'calves'],
      4: ['chest', 'shoulders', 'triceps', 'abs'],
      5: ['lats', 'traps', 'lower_back', 'biceps'],
      6: ['quads', 'hamstrings', 'glutes', 'calves'],
    }
  },
  { 
    id: 'bro_split', 
    label: 'Body Part Split', 
    description: '5-6 days per week, one muscle group per day',
    defaultDays: 5,
    presetMuscles: {
      1: ['chest', 'abs'],
      2: ['lats', 'traps', 'upper_back', 'lower_back'],
      3: ['shoulders', 'abs'],
      4: ['biceps', 'triceps', 'forearms'],
      5: ['quads', 'hamstrings', 'glutes', 'calves'],
    }
  },
  { 
    id: 'custom', 
    label: 'Custom', 
    description: 'Create your own schedule',
    defaultDays: 3,
    presetMuscles: {}
  },
];

const DURATIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 75, label: '75 min' },
  { value: 90, label: '90 min' },
];

type DayMuscles = {
  [day: number]: string[];
};

export default function ScheduleOnboarding() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  
  const [workoutSplit, setWorkoutSplit] = useState(user?.workout_preferences?.split || 'full_body');
  const [numDays, setNumDays] = useState(user?.schedule?.num_days || 3);
  const [duration, setDuration] = useState(user?.schedule?.duration || 45);
  const [dayMuscles, setDayMuscles] = useState<DayMuscles>(user?.schedule?.day_muscles || {});
  const [loading, setLoading] = useState(false);
  const [activeDayModal, setActiveDayModal] = useState<number | null>(null);

  // Update day muscles when split or num days changes
  useEffect(() => {
    const split = WORKOUT_SPLITS.find(s => s.id === workoutSplit);
    if (split && split.id !== 'custom') {
      const newDayMuscles: DayMuscles = {};
      for (let i = 1; i <= numDays; i++) {
        const dayIndex = ((i - 1) % Object.keys(split.presetMuscles).length) + 1;
        newDayMuscles[i] = split.presetMuscles[dayIndex] || [];
      }
      setDayMuscles(newDayMuscles);
    }
  }, [workoutSplit, numDays]);

  const handleSplitChange = (splitId: string) => {
    setWorkoutSplit(splitId);
    const split = WORKOUT_SPLITS.find(s => s.id === splitId);
    if (split) {
      setNumDays(split.defaultDays);
    }
  };

  const toggleMuscleForDay = (day: number, muscleId: string) => {
    setDayMuscles(prev => {
      const currentMuscles = prev[day] || [];
      const newMuscles = currentMuscles.includes(muscleId)
        ? currentMuscles.filter(m => m !== muscleId)
        : [...currentMuscles, muscleId];
      return { ...prev, [day]: newMuscles };
    });
  };

  const getDayLabel = (day: number) => {
    const split = WORKOUT_SPLITS.find(s => s.id === workoutSplit);
    if (split?.id === 'push_pull_legs') {
      const labels = ['Push', 'Pull', 'Legs'];
      return labels[(day - 1) % 3];
    }
    if (split?.id === 'upper_lower') {
      return day % 2 === 1 ? 'Upper' : 'Lower';
    }
    return `Day ${day}`;
  };

  const getViewForMuscles = (muscles: string[]): 'front' | 'back' => {
    const backMuscles = ['traps', 'lats', 'upper_back', 'lower_back', 'hamstrings', 'glutes'];
    const frontMuscles = ['chest', 'abs', 'obliques', 'quads', 'biceps', 'shoulders'];
    
    const backCount = muscles.filter(m => backMuscles.includes(m)).length;
    const frontCount = muscles.filter(m => frontMuscles.includes(m)).length;
    
    return backCount > frontCount ? 'back' : 'front';
  };

  const handleComplete = async () => {
    if (numDays === 0) {
      Alert.alert('Select Days', 'Please select at least one training day');
      return;
    }

    // Check if any day has muscles selected
    const hasEmptyDays = Object.keys(dayMuscles).length === 0 || 
      Object.values(dayMuscles).some(muscles => muscles.length === 0);
    
    if (hasEmptyDays && workoutSplit === 'custom') {
      Alert.alert('Select Muscles', 'Please select target muscles for each training day');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        schedule: {
          num_days: numDays,
          duration,
          day_muscles: dayMuscles,
        },
        workout_preferences: {
          split: workoutSplit,
        },
        profile_complete: true,
        onboarding_step: 5,
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.root}>
      <ForgeVideoBackground />
      <View style={styles.contentLayer}>
      <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>

        <View style={styles.header}>
          <Text style={styles.step}>Step 5 of 5</Text>
          <Text style={styles.title}>Set Your Schedule</Text>
          <Text style={styles.subtitle}>Plan your training rotation</Text>
        </View>

        {/* Workout Split Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Split</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.splitScrollContent}
          >
            {WORKOUT_SPLITS.map((split) => (
              <TouchableOpacity
                key={split.id}
                style={[
                  styles.splitChip,
                  workoutSplit === split.id && styles.splitChipSelected,
                ]}
                onPress={() => handleSplitChange(split.id)}
              >
                <Text style={[
                  styles.splitChipText,
                  workoutSplit === split.id && styles.splitChipTextSelected,
                ]}>
                  {split.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.splitDescription}>
            {WORKOUT_SPLITS.find(s => s.id === workoutSplit)?.description}
          </Text>
        </View>

        {/* Training Days Per Week */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Days Per Week</Text>
          <View style={styles.daysGrid}>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayNumChip,
                  numDays === day && styles.dayNumChipSelected,
                ]}
                onPress={() => setNumDays(day)}
              >
                <Text style={[
                  styles.dayNumText,
                  numDays === day && styles.dayNumTextSelected,
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helperText}>{numDays} day{numDays !== 1 ? 's' : ''} per week</Text>
        </View>

        {/* Session Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Duration</Text>
          <View style={styles.durationGrid}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d.value}
                style={[
                  styles.durationChip,
                  duration === d.value && styles.durationChipSelected,
                ]}
                onPress={() => setDuration(d.value)}
              >
                <Text style={[
                  styles.durationText,
                  duration === d.value && styles.durationTextSelected,
                ]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Day by Day Muscle Targets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Muscles Per Day</Text>
          <Text style={styles.helperText}>Tap each day to customize muscle targets</Text>
          
          <View style={styles.daysContainer}>
            {Array.from({ length: numDays }, (_, i) => i + 1).map((day) => {
              const muscles = dayMuscles[day] || [];
              const viewAngle = getViewForMuscles(muscles);
              
              return (
                <TouchableOpacity
                  key={day}
                  style={styles.dayCard}
                  onPress={() => setActiveDayModal(day)}
                >
                  <View style={styles.dayCardHeader}>
                    <Text style={styles.dayCardTitle}>{getDayLabel(day)}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                  </View>
                  
                  <View style={styles.dayCardContent}>
                    <View style={styles.anatomyContainer}>
                      <BodyAnatomy
                        selectedMuscles={muscles}
                        view={viewAngle}
                        size={100}
                      />
                      <Text style={styles.viewLabel}>{viewAngle === 'front' ? 'Front' : 'Back'}</Text>
                    </View>
                    
                    <View style={styles.muscleList}>
                      {muscles.length > 0 ? (
                        muscles.slice(0, 4).map((muscleId) => {
                          const muscle = ALL_MUSCLES.find(m => m.id === muscleId);
                          return (
                            <View key={muscleId} style={styles.muscleTag}>
                              <Text style={styles.muscleTagText}>{muscle?.label || muscleId}</Text>
                            </View>
                          );
                        })
                      ) : (
                        <Text style={styles.noMusclesText}>Tap to select muscles</Text>
                      )}
                      {muscles.length > 4 && (
                        <Text style={styles.moreText}>+{muscles.length - 4} more</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Button
          title="Complete Setup"
          onPress={handleComplete}
          loading={loading}
          size="large"
          style={styles.completeButton}
          icon={<Ionicons name="checkmark-circle" size={20} color="#fff" />}
        />
      </ScrollView>

      {/* Muscle Selection Modal */}
      <Modal
        visible={activeDayModal !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveDayModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeDayModal ? getDayLabel(activeDayModal) : ''} - Select Muscles
              </Text>
              <TouchableOpacity onPress={() => setActiveDayModal(null)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {activeDayModal && (
                <>
                  {/* Body Anatomy Preview */}
                  <View style={styles.anatomyPreview}>
                    <View style={styles.anatomyColumn}>
                      <BodyAnatomy
                        selectedMuscles={dayMuscles[activeDayModal] || []}
                        view="front"
                        size={140}
                      />
                      <Text style={styles.anatomyLabel}>Front</Text>
                    </View>
                    <View style={styles.anatomyColumn}>
                      <BodyAnatomy
                        selectedMuscles={dayMuscles[activeDayModal] || []}
                        view="back"
                        size={140}
                      />
                      <Text style={styles.anatomyLabel}>Back</Text>
                    </View>
                  </View>

                  {/* Upper Body - Front */}
                  <Text style={styles.muscleGroupTitle}>Upper Body (Front)</Text>
                  <View style={styles.muscleGrid}>
                    {MUSCLE_GROUPS.upper_front.map((muscle) => (
                      <TouchableOpacity
                        key={muscle.id}
                        style={[
                          styles.muscleChip,
                          (dayMuscles[activeDayModal] || []).includes(muscle.id) && styles.muscleChipSelected,
                        ]}
                        onPress={() => toggleMuscleForDay(activeDayModal, muscle.id)}
                      >
                        <Ionicons
                          name={muscle.icon as any}
                          size={16}
                          color={(dayMuscles[activeDayModal] || []).includes(muscle.id) ? '#76FF00' : '#888'}
                        />
                        <Text style={[
                          styles.muscleChipText,
                          (dayMuscles[activeDayModal] || []).includes(muscle.id) && styles.muscleChipTextSelected,
                        ]}>
                          {muscle.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Upper Body - Back */}
                  <Text style={styles.muscleGroupTitle}>Upper Body (Back)</Text>
                  <View style={styles.muscleGrid}>
                    {MUSCLE_GROUPS.upper_back.map((muscle) => (
                      <TouchableOpacity
                        key={muscle.id}
                        style={[
                          styles.muscleChip,
                          (dayMuscles[activeDayModal] || []).includes(muscle.id) && styles.muscleChipSelected,
                        ]}
                        onPress={() => toggleMuscleForDay(activeDayModal, muscle.id)}
                      >
                        <Ionicons
                          name={muscle.icon as any}
                          size={16}
                          color={(dayMuscles[activeDayModal] || []).includes(muscle.id) ? '#76FF00' : '#888'}
                        />
                        <Text style={[
                          styles.muscleChipText,
                          (dayMuscles[activeDayModal] || []).includes(muscle.id) && styles.muscleChipTextSelected,
                        ]}>
                          {muscle.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Lower Body */}
                  <Text style={styles.muscleGroupTitle}>Lower Body</Text>
                  <View style={styles.muscleGrid}>
                    {MUSCLE_GROUPS.lower.map((muscle) => (
                      <TouchableOpacity
                        key={muscle.id}
                        style={[
                          styles.muscleChip,
                          (dayMuscles[activeDayModal] || []).includes(muscle.id) && styles.muscleChipSelected,
                        ]}
                        onPress={() => toggleMuscleForDay(activeDayModal, muscle.id)}
                      >
                        <Ionicons
                          name={muscle.icon as any}
                          size={16}
                          color={(dayMuscles[activeDayModal] || []).includes(muscle.id) ? '#76FF00' : '#888'}
                        />
                        <Text style={[
                          styles.muscleChipText,
                          (dayMuscles[activeDayModal] || []).includes(muscle.id) && styles.muscleChipTextSelected,
                        ]}>
                          {muscle.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Grip & Wrists */}
                  <Text style={styles.muscleGroupTitle}>Grip & Forearms</Text>
                  <View style={styles.muscleGrid}>
                    {MUSCLE_GROUPS.grip.map((muscle) => (
                      <TouchableOpacity
                        key={muscle.id}
                        style={[
                          styles.muscleChip,
                          (dayMuscles[activeDayModal] || []).includes(muscle.id) && styles.muscleChipSelected,
                        ]}
                        onPress={() => toggleMuscleForDay(activeDayModal, muscle.id)}
                      >
                        <Ionicons
                          name={muscle.icon as any}
                          size={16}
                          color={(dayMuscles[activeDayModal] || []).includes(muscle.id) ? '#76FF00' : '#888'}
                        />
                        <Text style={[
                          styles.muscleChipText,
                          (dayMuscles[activeDayModal] || []).includes(muscle.id) && styles.muscleChipTextSelected,
                        ]}>
                          {muscle.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            <Button
              title="Done"
              onPress={() => setActiveDayModal(null)}
              style={styles.modalDoneButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    elevation: 2,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#76FF00',
    borderRadius: 2,
  },
  header: {
    marginBottom: 24,
  },
  step: {
    color: '#76FF00',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  splitScrollContent: {
    gap: 10,
    paddingRight: 24,
  },
  splitChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  splitChipSelected: {
    backgroundColor: 'rgba(118,255,0,0.15)',
    borderColor: '#76FF00',
  },
  splitChipText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  splitChipTextSelected: {
    color: '#76FF00',
  },
  splitDescription: {
    color: '#666',
    fontSize: 13,
    marginTop: 10,
    fontStyle: 'italic',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayNumChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumChipSelected: {
    backgroundColor: 'rgba(118,255,0,0.15)',
    borderColor: '#76FF00',
  },
  dayNumText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '700',
  },
  dayNumTextSelected: {
    color: '#76FF00',
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: 10,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  durationChipSelected: {
    backgroundColor: 'rgba(118,255,0,0.15)',
    borderColor: '#76FF00',
  },
  durationText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  durationTextSelected: {
    color: '#76FF00',
  },
  daysContainer: {
    gap: 12,
    marginTop: 12,
  },
  dayCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayCardTitle: {
    color: '#76FF00',
    fontSize: 16,
    fontWeight: '700',
  },
  dayCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anatomyContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  viewLabel: {
    color: '#666',
    fontSize: 10,
    marginTop: 4,
  },
  muscleList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleTag: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  muscleTagText: {
    color: '#76FF00',
    fontSize: 12,
    fontWeight: '500',
  },
  noMusclesText: {
    color: '#666',
    fontSize: 13,
    fontStyle: 'italic',
  },
  moreText: {
    color: '#888',
    fontSize: 12,
  },
  completeButton: {
    marginTop: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  anatomyPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
  },
  anatomyColumn: {
    alignItems: 'center',
  },
  anatomyLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
  muscleGroupTitle: {
    color: '#76FF00',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#333',
  },
  muscleChipSelected: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderColor: '#76FF00',
  },
  muscleChipText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  muscleChipTextSelected: {
    color: '#76FF00',
  },
  modalDoneButton: {
    marginTop: 24,
  },
});
