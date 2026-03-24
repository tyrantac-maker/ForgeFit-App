import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WORKOUT_SPLITS = [
  { id: 'full_body', label: 'Full Body', description: '2-3 days per week, hit all muscles each session' },
  { id: 'upper_lower', label: 'Upper/Lower', description: '4 days per week, alternate upper and lower body' },
  { id: 'push_pull_legs', label: 'Push/Pull/Legs', description: '3-6 days per week, organized by movement pattern' },
  { id: 'bro_split', label: 'Body Part Split', description: '5-6 days per week, one muscle group per day' },
  { id: 'custom', label: 'Custom', description: 'Create your own schedule' },
];

const DURATIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 75, label: '75 min' },
  { value: 90, label: '90 min' },
];

export default function ScheduleOnboarding() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  
  const [selectedDays, setSelectedDays] = useState<string[]>(
    user?.schedule?.days || ['Monday', 'Wednesday', 'Friday']
  );
  const [workoutSplit, setWorkoutSplit] = useState(user?.workout_preferences?.split || 'full_body');
  const [duration, setDuration] = useState(user?.schedule?.duration || 45);
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleComplete = async () => {
    if (selectedDays.length === 0) {
      Alert.alert('Select Days', 'Please select at least one training day');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        schedule: {
          days: selectedDays,
          duration,
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
          <Text style={styles.subtitle}>Let's plan your training week</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Days</Text>
          <View style={styles.daysGrid}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayChip,
                  selectedDays.includes(day) && styles.dayChipSelected,
                ]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[
                  styles.dayText,
                  selectedDays.includes(day) && styles.dayTextSelected,
                ]}>
                  {day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helperText}>
            {selectedDays.length} days selected
          </Text>
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Split</Text>
          <View style={styles.splitsContainer}>
            {WORKOUT_SPLITS.map((split) => (
              <TouchableOpacity
                key={split.id}
                style={[
                  styles.splitCard,
                  workoutSplit === split.id && styles.splitCardSelected,
                ]}
                onPress={() => setWorkoutSplit(split.id)}
              >
                <View style={styles.splitContent}>
                  <Text style={[
                    styles.splitLabel,
                    workoutSplit === split.id && styles.splitLabelSelected,
                  ]}>
                    {split.label}
                  </Text>
                  <Text style={styles.splitDescription}>{split.description}</Text>
                </View>
                {workoutSplit === split.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title="Complete Setup"
          onPress={handleComplete}
          loading={loading}
          size="large"
          disabled={selectedDays.length === 0}
          style={styles.completeButton}
          icon={<Ionicons name="checkmark-circle" size={20} color="#fff" />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
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
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  header: {
    marginBottom: 32,
  },
  step: {
    color: '#FF6B35',
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
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    minWidth: 60,
    alignItems: 'center',
  },
  dayChipSelected: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    borderColor: '#FF6B35',
  },
  dayText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#FF6B35',
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: 12,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  durationChipSelected: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    borderColor: '#FF6B35',
  },
  durationText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  durationTextSelected: {
    color: '#FF6B35',
  },
  splitsContainer: {
    gap: 12,
  },
  splitCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  splitCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  splitContent: {
    flex: 1,
  },
  splitLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  splitLabelSelected: {
    color: '#FF6B35',
  },
  splitDescription: {
    color: '#888',
    fontSize: 13,
  },
  completeButton: {
    marginTop: 'auto',
  },
});
