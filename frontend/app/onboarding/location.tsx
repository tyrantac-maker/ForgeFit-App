import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { getGymChains } from '../../src/data/countries';
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

  const countryCode = user?.country_code || '';
  const city = user?.location || '';
  const country = user?.country || '';
  const gymChains = useMemo(() => getGymChains(countryCode), [countryCode]);

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

  const openGoogleMapsGyms = () => {
    const query = city
      ? `gyms near ${city}${country ? ', ' + country : ''}`
      : `gyms near ${country || 'me'}`;
    const encoded = encodeURIComponent(query);
    Linking.openURL(`https://maps.google.com/?q=${encoded}`);
  };

  const openGymOnMap = (name: string) => {
    const query = city ? `${name} near ${city}` : name;
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(query)}`);
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
            keyboardShouldPersistTaps="handled"
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
                  <View style={[styles.iconContainer, trainingLocation === loc.id && styles.iconContainerSelected]}>
                    <Ionicons name={loc.icon as any} size={32} color={trainingLocation === loc.id ? BRAND_GREEN : '#888'} />
                  </View>
                  <View style={styles.locationContent}>
                    <Text style={[styles.locationLabel, trainingLocation === loc.id && styles.locationLabelSelected]}>
                      {loc.label}
                    </Text>
                    <Text style={styles.locationDescription}>{loc.description}</Text>
                  </View>
                  {trainingLocation === loc.id && <Ionicons name="checkmark-circle" size={24} color={BRAND_GREEN} />}
                </TouchableOpacity>
              ))}
            </View>

            {showGymInput && (
              <View style={styles.gymSection}>
                <Text style={styles.sectionTitle}>Your Gym</Text>

                {gymChains.length > 0 && (
                  <>
                    <Text style={styles.sectionSubtitle}>
                      Popular gyms in {country || 'your country'}
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.gymChipsScroll}
                      contentContainerStyle={styles.gymChips}
                    >
                      {gymChains.map((chain) => (
                        <TouchableOpacity
                          key={chain}
                          style={[styles.gymChip, gymName === chain && styles.gymChipSelected]}
                          onPress={() => setGymName(gymName === chain ? '' : chain)}
                        >
                          <Text style={[styles.gymChipText, gymName === chain && styles.gymChipTextSelected]}>
                            {chain}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}

                <Input
                  placeholder="Type gym name or select above"
                  value={gymName}
                  onChangeText={setGymName}
                  icon="business-outline"
                />

                <View style={styles.mapsButtonRow}>
                  <TouchableOpacity style={styles.mapsButton} onPress={openGoogleMapsGyms}>
                    <Ionicons name="map-outline" size={16} color={BRAND_GREEN} />
                    <Text style={styles.mapsButtonText}>Find Gyms Near Me on Maps</Text>
                  </TouchableOpacity>

                  {gymName.trim().length > 0 && (
                    <TouchableOpacity style={styles.mapsButtonSecondary} onPress={() => openGymOnMap(gymName)}>
                      <Ionicons name="location-outline" size={16} color="#888" />
                      <Text style={styles.mapsButtonSecondaryText}>View "{gymName}" on Map</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.helperText}>
                  Tap "Find Gyms Near Me" to see gym locations on Google Maps, then come back and enter your gym name. We'll use it to tailor exercise recommendations to your equipment.
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
  root: { flex: 1, backgroundColor: '#000' },
  contentLayer: { ...StyleSheet.absoluteFillObject, zIndex: 2, elevation: 2 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, marginBottom: 24 },
  progressFill: { height: '100%', backgroundColor: '#76FF00', borderRadius: 2 },
  header: { marginBottom: 32 },
  step: { color: '#76FF00', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888' },
  optionsContainer: { gap: 16, marginBottom: 32 },
  locationCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.12)' },
  locationCardSelected: { borderColor: '#76FF00', backgroundColor: 'rgba(118,255,0,0.08)' },
  iconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  iconContainerSelected: { backgroundColor: 'rgba(118,255,0,0.15)' },
  locationContent: { flex: 1 },
  locationLabel: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  locationLabelSelected: { color: '#76FF00' },
  locationDescription: { color: '#888', fontSize: 14 },
  gymSection: { marginBottom: 32 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  sectionSubtitle: { color: '#888', fontSize: 13, marginBottom: 12 },
  gymChipsScroll: { marginBottom: 16 },
  gymChips: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  gymChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  gymChipSelected: { backgroundColor: 'rgba(118,255,0,0.12)', borderColor: '#76FF00' },
  gymChipText: { color: '#ccc', fontSize: 13 },
  gymChipTextSelected: { color: '#76FF00', fontWeight: '600' },
  mapsButtonRow: { gap: 10, marginTop: 4, marginBottom: 12 },
  mapsButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(118,255,0,0.1)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(118,255,0,0.3)', padding: 12 },
  mapsButtonText: { color: BRAND_GREEN, fontSize: 14, fontWeight: '600' },
  mapsButtonSecondary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 12 },
  mapsButtonSecondaryText: { color: '#888', fontSize: 14 },
  helperText: { color: '#555', fontSize: 12, lineHeight: 18 },
  continueButton: { marginTop: 'auto' },
});
