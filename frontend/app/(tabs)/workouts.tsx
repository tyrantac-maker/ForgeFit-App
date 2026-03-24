import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useWorkoutStore, Workout } from '../../src/store/workoutStore';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';

export default function WorkoutsScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { workouts, fetchWorkouts, generateAIWorkout, isLoading } = useWorkoutStore();
  
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(45);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);

  useEffect(() => {
    if (token) {
      fetchWorkouts(token);
    }
  }, [token]);

  const focusOptions = [
    { id: 'muscle_gain', label: 'Muscle', icon: 'barbell-outline' },
    { id: 'strength', label: 'Strength', icon: 'fitness-outline' },
    { id: 'fat_loss', label: 'Fat Loss', icon: 'flame-outline' },
    { id: 'conditioning', label: 'Cardio', icon: 'pulse-outline' },
  ];

  const toggleFocus = (id: string) => {
    setSelectedFocus((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleGenerateWorkout = async () => {
    if (!token) return;
    
    setGenerating(true);
    try {
      const workout = await generateAIWorkout(token, {
        duration_minutes: selectedDuration,
        focus_areas: selectedFocus.length > 0 ? selectedFocus : undefined,
      });
      setShowGenerateModal(false);
      router.push(`/workout/${workout.id}` as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate workout');
    } finally {
      setGenerating(false);
    }
  };

  const getWorkoutTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      full_body: 'body-outline',
      upper: 'chevron-up-outline',
      lower: 'chevron-down-outline',
      push: 'arrow-forward-outline',
      pull: 'arrow-back-outline',
      legs: 'footsteps-outline',
      custom: 'create-outline',
    };
    return icons[type] || 'barbell-outline';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowGenerateModal(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Button
          title="Generate AI Workout"
          onPress={() => setShowGenerateModal(true)}
          style={styles.generateButton}
          icon={<Ionicons name="sparkles" size={20} color="#fff" />}
        />

        {workouts.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={64} color="#333" />
            <Text style={styles.emptyTitle}>No Workouts Yet</Text>
            <Text style={styles.emptyText}>
              Generate your first AI workout or create a custom one
            </Text>
          </View>
        ) : (
          <View style={styles.workoutsList}>
            {workouts.map((workout) => (
              <Card
                key={workout.id}
                style={styles.workoutCard}
                onPress={() => router.push(`/workout/${workout.id}` as any)}
              >
                <View style={styles.workoutHeader}>
                  <View style={[
                    styles.workoutIcon,
                    workout.ai_generated && styles.workoutIconAI,
                  ]}>
                    <Ionicons
                      name={workout.ai_generated ? 'sparkles' : getWorkoutTypeIcon(workout.workout_type) as any}
                      size={24}
                      color={workout.ai_generated ? '#FF6B35' : '#888'}
                    />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutMeta}>
                      {workout.exercises?.length || 0} exercises • {workout.estimated_duration} min
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
                {workout.day_of_week && (
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>{workout.day_of_week}</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showGenerateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGenerateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate AI Workout</Text>
              <TouchableOpacity onPress={() => setShowGenerateModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Duration</Text>
            <View style={styles.durationOptions}>
              {[30, 45, 60, 75].map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.durationChip,
                    selectedDuration === dur && styles.durationChipSelected,
                  ]}
                  onPress={() => setSelectedDuration(dur)}
                >
                  <Text style={[
                    styles.durationText,
                    selectedDuration === dur && styles.durationTextSelected,
                  ]}>
                    {dur} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Focus (optional)</Text>
            <View style={styles.focusOptions}>
              {focusOptions.map((focus) => (
                <TouchableOpacity
                  key={focus.id}
                  style={[
                    styles.focusChip,
                    selectedFocus.includes(focus.id) && styles.focusChipSelected,
                  ]}
                  onPress={() => toggleFocus(focus.id)}
                >
                  <Ionicons
                    name={focus.icon as any}
                    size={20}
                    color={selectedFocus.includes(focus.id) ? '#FF6B35' : '#888'}
                  />
                  <Text style={[
                    styles.focusText,
                    selectedFocus.includes(focus.id) && styles.focusTextSelected,
                  ]}>
                    {focus.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={generating ? 'Generating...' : 'Generate Workout'}
              onPress={handleGenerateWorkout}
              loading={generating}
              disabled={generating}
              style={styles.generateModalButton}
              icon={!generating && <Ionicons name="sparkles" size={20} color="#fff" />}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  generateButton: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 250,
  },
  workoutsList: {
    gap: 12,
  },
  workoutCard: {
    padding: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutIconAI: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutMeta: {
    color: '#888',
    fontSize: 14,
  },
  dayBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dayBadgeText: {
    color: '#FF6B35',
    fontSize: 10,
    fontWeight: '600',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  modalLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  durationChipSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  durationText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  durationTextSelected: {
    color: '#FF6B35',
  },
  focusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    gap: 8,
  },
  focusChipSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  focusText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  focusTextSelected: {
    color: '#FF6B35',
  },
  generateModalButton: {
    marginTop: 8,
  },
});
