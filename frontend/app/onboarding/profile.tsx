import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';

export default function ProfileOnboarding() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [country, setCountry] = useState(user?.country || '');
  const [location, setLocation] = useState(user?.location || '');
  const [fitnessLevel, setFitnessLevel] = useState(user?.fitness_level || '');
  const [loading, setLoading] = useState(false);

  const fitnessLevels = [
    { id: 'beginner', label: 'Beginner', description: 'New to working out' },
    { id: 'intermediate', label: 'Intermediate', description: '1-3 years experience' },
    { id: 'advanced', label: 'Advanced', description: '3+ years experience' },
  ];

  const handleContinue = async () => {
    if (!age || !height || !weight || !fitnessLevel) {
      Alert.alert('Required Fields', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        age: parseInt(age),
        height: parseFloat(height),
        weight: parseFloat(weight),
        country,
        location,
        fitness_level: fitnessLevel,
        starting_weight: parseFloat(weight),
        onboarding_step: 1,
      });
      router.push('/onboarding/goals');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '20%' }]} />
          </View>

          <View style={styles.header}>
            <Text style={styles.step}>Step 1 of 5</Text>
            <Text style={styles.title}>Let's Get to Know You</Text>
            <Text style={styles.subtitle}>This helps us personalize your workouts</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Age *"
                  placeholder="Years"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  icon="calendar-outline"
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Height (cm) *"
                  placeholder="cm"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  icon="resize-outline"
                />
              </View>
            </View>

            <Input
              label="Current Weight (kg) *"
              placeholder="Enter your weight"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              icon="scale-outline"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Country"
                  placeholder="Country"
                  value={country}
                  onChangeText={setCountry}
                  icon="globe-outline"
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="City"
                  placeholder="City"
                  value={location}
                  onChangeText={setLocation}
                  icon="location-outline"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Fitness Level *</Text>
            <View style={styles.optionsContainer}>
              {fitnessLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.optionCard,
                    fitnessLevel === level.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setFitnessLevel(level.id)}
                >
                  <View style={styles.optionContent}>
                    <Text style={[
                      styles.optionLabel,
                      fitnessLevel === level.id && styles.optionLabelSelected,
                    ]}>
                      {level.label}
                    </Text>
                    <Text style={styles.optionDescription}>{level.description}</Text>
                  </View>
                  {fitnessLevel === level.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            size="large"
            style={styles.continueButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
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
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  optionCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#FF6B35',
  },
  optionDescription: {
    color: '#888',
    fontSize: 14,
  },
  continueButton: {
    marginTop: 'auto',
  },
});
