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
import { Input } from '../../src/components/Input';

const GOALS = [
  { id: 'muscle_gain', label: 'Build Muscle', icon: 'barbell-outline', description: 'Increase muscle mass and size' },
  { id: 'strength', label: 'Get Stronger', icon: 'fitness-outline', description: 'Improve strength and power' },
  { id: 'fat_loss', label: 'Lose Fat', icon: 'flame-outline', description: 'Burn fat and get lean' },
  { id: 'conditioning', label: 'Conditioning', icon: 'pulse-outline', description: 'Improve cardiovascular fitness' },
  { id: 'endurance', label: 'Build Endurance', icon: 'timer-outline', description: 'Increase stamina' },
  { id: 'calisthenics', label: 'Calisthenics', icon: 'body-outline', description: 'Master bodyweight movements' },
  { id: 'general_fitness', label: 'General Fitness', icon: 'heart-outline', description: 'Overall health and wellness' },
];

export default function GoalsOnboarding() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  
  const [selectedGoals, setSelectedGoals] = useState<string[]>(user?.goals || []);
  const [goalWeight, setGoalWeight] = useState(user?.goal_weight?.toString() || '');
  const [loading, setLoading] = useState(false);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) {
      Alert.alert('Select Goals', 'Please select at least one fitness goal');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        goals: selectedGoals,
        goal_weight: goalWeight ? parseFloat(goalWeight) : undefined,
        onboarding_step: 2,
      });
      router.push('/onboarding/location');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save goals');
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
          <View style={[styles.progressFill, { width: '40%' }]} />
        </View>

        <View style={styles.header}>
          <Text style={styles.step}>Step 2 of 5</Text>
          <Text style={styles.title}>What Are Your Goals?</Text>
          <Text style={styles.subtitle}>Select all that apply to you</Text>
        </View>

        <View style={styles.goalsGrid}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoals.includes(goal.id) && styles.goalCardSelected,
              ]}
              onPress={() => toggleGoal(goal.id)}
            >
              <View style={[
                styles.goalIconContainer,
                selectedGoals.includes(goal.id) && styles.goalIconContainerSelected,
              ]}>
                <Ionicons
                  name={goal.icon as any}
                  size={28}
                  color={selectedGoals.includes(goal.id) ? '#FF6B35' : '#888'}
                />
              </View>
              <Text style={[
                styles.goalLabel,
                selectedGoals.includes(goal.id) && styles.goalLabelSelected,
              ]}>
                {goal.label}
              </Text>
              <Text style={styles.goalDescription}>{goal.description}</Text>
              {selectedGoals.includes(goal.id) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.weightGoalSection}>
          <Text style={styles.sectionTitle}>Target Weight (Optional)</Text>
          <Input
            placeholder="Enter your goal weight in kg"
            value={goalWeight}
            onChangeText={setGoalWeight}
            keyboardType="numeric"
            icon="trending-up-outline"
          />
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          size="large"
          disabled={selectedGoals.length === 0}
          style={styles.continueButton}
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
    marginBottom: 24,
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
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  goalCard: {
    width: '47%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2A2A2A',
    position: 'relative',
  },
  goalCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  goalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  goalIconContainerSelected: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  goalLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalLabelSelected: {
    color: '#FF6B35',
  },
  goalDescription: {
    color: '#666',
    fontSize: 12,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightGoalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  continueButton: {
    marginTop: 'auto',
  },
});
