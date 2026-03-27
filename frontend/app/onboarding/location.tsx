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
import ForgeVideoBackground from '../../src/components/ForgeVideoBackground';

const BRAND_GREEN = '#76FF00';

const LOCATIONS = [
  { id: 'home', label: 'Home', icon: 'home-outline', description: 'Workout at home with available equipment' },
  { id: 'gym', label: 'Gym', icon: 'barbell-outline', description: 'Access to full gym equipment' },
  { id: 'both', label: 'Both', icon: 'swap-horizontal-outline', description: 'Mix of home and gym workouts' },
];

export default function LocationOnboarding() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const [trainingLocation, setTrainingLocation] = useState(user?.training_location || '');
  const [gymName, setGymName] = useState(user?.gym_name || '');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!trainingLocation) {
      Alert.alert('Select Location', "Please select where you'll be training");
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        training_location: trainingLocation,
        gym_name: gymName || undefined,
        onboarding_step: 3,
      });
      router.push('/onboarding/equipment');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  const showGymInput = trainingLocation === 'gym' || trainingLocation === 'both';

  return (
    <View style={styles.root}>
      <ForgeVideoBackground />

      <View style={styles.contentLayer}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>

            <View style={styles.header}>
              <Text style={styles.step}>Step 3 of 5</Text>
              <Text style={styles.title}>Where Will You Train?</Text>
              <Text style={styles.subtitle}>We'll customize workouts based on your environment</Text>
            </View>

            <View style={styles.optionsContainer}>
              {LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={[styles.locationCard, trainingLocation === loc.id && styles.locationCardSelected]}
                  onPress={() => setTrainingLocation(loc.id)}
                >
                  <View style={[
                    styles.iconContainer,
                    trainingLocation === loc.id && styles.iconContainerSelected,
                  ]}>
                    <Ionicons
                      name={loc.icon as any}
                      size={32}
                      color={trainingLocation === loc.id ? BRAND_GREEN : '#888'}
                    />
                  </View>
                  <View style={styles.locationContent}>
                    <Text style={[
                      styles.locationLabel,
                      trainingLocation === loc.id && styles.locationLabelSelected,
                    ]}>
                      {loc.label}
                    </Text>
                    <Text style={styles.locationDescription}>{loc.description}</Text>
                  </View>
                  {trainingLocation === loc.id && (
                    <Ionicons name="checkmark-circle" size={24} color={BRAND_GREEN} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {showGymInput && (
              <View style={styles.gymInputSection}>
                <Text style={styles.sectionTitle}>Your Gym (Optional)</Text>
                <Input
                  placeholder="Enter gym name"
                  value={gymName}
                  onChangeText={setGymName}
                  icon="business-outline"
                />
                <Text style={styles.helperText}>
                  This helps us recommend equipment-specific exercises
                </Text>
              </View>
            )}

            <Button
              title="Continue"
              onPress={handleContinue}
              loading={loading}
              size="large"
              disabled={!trainingLocation}
              style={styles.continueButton}
            />
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
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
    marginBottom: 32,
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
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  locationCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  locationCardSelected: {
    borderColor: '#76FF00',
    backgroundColor: 'rgba(118,255,0,0.08)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(118,255,0,0.15)',
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationLabelSelected: {
    color: '#76FF00',
  },
  locationDescription: {
    color: '#888',
    fontSize: 14,
  },
  gymInputSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  continueButton: {
    marginTop: 'auto',
  },
});
