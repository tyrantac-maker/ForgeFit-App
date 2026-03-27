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
import ForgeVideoBackground from '../../src/components/ForgeVideoBackground';

const BRAND_GREEN = '#76FF00';

export default function ProfileOnboarding() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const [age, setAge] = useState(user?.age?.toString() || '');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft_in'>(user?.height_unit || 'cm');
  const [heightCm, setHeightCm] = useState(user?.height?.toString() || '');
  const [heightFeet, setHeightFeet] = useState(user?.height_feet?.toString() || '');
  const [heightInches, setHeightInches] = useState(user?.height_inches?.toString() || '');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs' | 'stone'>(user?.weight_unit || 'kg');
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

  const getHeightInCm = () => {
    if (heightUnit === 'cm') return parseFloat(heightCm) || 0;
    const feet = parseInt(heightFeet) || 0;
    const inches = parseInt(heightInches) || 0;
    return Math.round((feet * 30.48) + (inches * 2.54));
  };

  const getWeightInKg = () => {
    const w = parseFloat(weight) || 0;
    if (weightUnit === 'kg') return w;
    if (weightUnit === 'lbs') return Math.round(w * 0.453592 * 10) / 10;
    if (weightUnit === 'stone') return Math.round(w * 6.35029 * 10) / 10;
    return w;
  };

  const handleContinue = async () => {
    if (!age || !fitnessLevel) {
      Alert.alert('Required Fields', 'Please fill in age and fitness level');
      return;
    }
    if (heightUnit === 'cm' && !heightCm) {
      Alert.alert('Required Fields', 'Please enter your height');
      return;
    }
    if (heightUnit === 'ft_in' && (!heightFeet || !heightInches)) {
      Alert.alert('Required Fields', 'Please enter your height in feet and inches');
      return;
    }
    if (!weight) {
      Alert.alert('Required Fields', 'Please enter your weight');
      return;
    }

    const heightInCm = getHeightInCm();
    const weightInKg = getWeightInKg();

    setLoading(true);
    try {
      await updateProfile({
        age: parseInt(age),
        height: heightInCm,
        height_unit: heightUnit,
        height_feet: heightUnit === 'ft_in' ? parseInt(heightFeet) : undefined,
        height_inches: heightUnit === 'ft_in' ? parseInt(heightInches) : undefined,
        weight: weightInKg,
        weight_unit: weightUnit,
        country,
        location,
        fitness_level: fitnessLevel,
        starting_weight: weightInKg,
        onboarding_step: 1,
      });
      router.push('/onboarding/goals');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (user?.profile_complete) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.root}>
      <ForgeVideoBackground />

      <View style={styles.contentLayer}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerSection}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '20%' }]} />
            </View>

            <View style={styles.header}>
              <Text style={styles.step}>Step 1 of 5</Text>
              <Text style={styles.title}>Let's Get to Know You</Text>
              <Text style={styles.subtitle}>This helps us personalize your workouts</Text>
            </View>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.form}>
                <Input
                  label="Age *"
                  placeholder="Enter your age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  icon="calendar-outline"
                />

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Height *</Text>
                  <View style={styles.unitToggle}>
                    <TouchableOpacity
                      style={[styles.unitButton, heightUnit === 'cm' && styles.unitButtonActive]}
                      onPress={() => setHeightUnit('cm')}
                    >
                      <Text style={[styles.unitButtonText, heightUnit === 'cm' && styles.unitButtonTextActive]}>cm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.unitButton, heightUnit === 'ft_in' && styles.unitButtonActive]}
                      onPress={() => setHeightUnit('ft_in')}
                    >
                      <Text style={[styles.unitButtonText, heightUnit === 'ft_in' && styles.unitButtonTextActive]}>ft/in</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {heightUnit === 'cm' ? (
                  <Input
                    placeholder="Height in cm"
                    value={heightCm}
                    onChangeText={setHeightCm}
                    keyboardType="numeric"
                    icon="resize-outline"
                  />
                ) : (
                  <View style={styles.row}>
                    <View style={styles.halfInput}>
                      <Input placeholder="Feet" value={heightFeet} onChangeText={setHeightFeet} keyboardType="numeric" icon="resize-outline" />
                    </View>
                    <View style={styles.halfInput}>
                      <Input placeholder="Inches" value={heightInches} onChangeText={setHeightInches} keyboardType="numeric" />
                    </View>
                  </View>
                )}

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Body Weight *</Text>
                  <View style={styles.unitToggle}>
                    {(['kg', 'lbs', 'stone'] as const).map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitButton, weightUnit === u && styles.unitButtonActive]}
                        onPress={() => setWeightUnit(u)}
                      >
                        <Text style={[styles.unitButtonText, weightUnit === u && styles.unitButtonTextActive]}>
                          {u === 'stone' ? 'st' : u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Input
                  placeholder={`Weight in ${weightUnit === 'stone' ? 'stone' : weightUnit}`}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  icon="scale-outline"
                />

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Input label="Country" placeholder="Country" value={country} onChangeText={setCountry} icon="globe-outline" />
                  </View>
                  <View style={styles.halfInput}>
                    <Input label="City" placeholder="City" value={location} onChangeText={setLocation} icon="location-outline" />
                  </View>
                </View>

                <Text style={styles.sectionTitleStandalone}>Fitness Level *</Text>
                <View style={styles.optionsContainer}>
                  {fitnessLevels.map((level) => (
                    <TouchableOpacity
                      key={level.id}
                      style={[styles.optionCard, fitnessLevel === level.id && styles.optionCardSelected]}
                      onPress={() => setFitnessLevel(level.id)}
                    >
                      <View style={styles.optionContent}>
                        <Text style={[styles.optionLabel, fitnessLevel === level.id && styles.optionLabelSelected]}>
                          {level.label}
                        </Text>
                        <Text style={styles.optionDescription}>{level.description}</Text>
                      </View>
                      {fitnessLevel === level.id && (
                        <Ionicons name="checkmark-circle" size={24} color={BRAND_GREEN} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Button title="Continue" onPress={handleContinue} loading={loading} size="large" style={styles.continueButton} />
            </ScrollView>
          </KeyboardAvoidingView>
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
  safeArea: {
    flex: 1,
  },
  headerSection: {
    padding: 24,
    paddingBottom: 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#76FF00',
    borderRadius: 2,
  },
  header: {
    marginBottom: 16,
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
  form: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitleStandalone: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 2,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unitButtonActive: {
    backgroundColor: '#76FF00',
  },
  unitButtonText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  optionCardSelected: {
    borderColor: '#76FF00',
    backgroundColor: 'rgba(118,255,0,0.08)',
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
    color: '#76FF00',
  },
  optionDescription: {
    color: '#888',
    fontSize: 14,
  },
  continueButton: {
    marginTop: 'auto',
  },
});
