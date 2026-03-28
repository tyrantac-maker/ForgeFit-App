import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { SelectPicker } from '../../src/components/SelectPicker';
import { COUNTRIES, LANGUAGES } from '../../src/data/countries';
import ForgeVideoBackground from '../../src/components/ForgeVideoBackground';
import { useTranslation } from '../../src/hooks/useTranslation';
import * as Location from 'expo-location';

const BRAND_GREEN = '#76FF00';

const countryItems = COUNTRIES.map((c) => ({ label: c.name, value: c.code, icon: c.flag }));
const languageItems = LANGUAGES.map((l) => ({
  label: l.name,
  sublabel: l.nativeName !== l.name ? l.nativeName : undefined,
  value: l.code,
  icon: l.flag,
}));

function calcAge(dobStr: string): number | null {
  if (!dobStr) return null;
  const parts = dobStr.split('/');
  if (parts.length !== 3) return null;
  let day: number, month: number, year: number;
  [day, month, year] = [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])];
  if (isNaN(day) || isNaN(month) || isNaN(year) || year < 1900) return null;
  const today = new Date();
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) {
    age--;
  }
  return age > 0 && age < 120 ? age : null;
}

function formatDob(day: string, month: string, year: string): string {
  if (!day || !month || !year) return '';
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

export default function ProfileOnboarding() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuthStore();
  const { t } = useTranslation();

  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  const dobStr = formatDob(dobDay, dobMonth, dobYear);
  const computedAge = calcAge(dobStr);

  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft_in'>(user?.height_unit || 'cm');
  const [heightCm, setHeightCm] = useState(user?.height?.toString() || '');
  const [heightFeet, setHeightFeet] = useState(user?.height_feet?.toString() || '');
  const [heightInches, setHeightInches] = useState(user?.height_inches?.toString() || '');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs' | 'stone'>(user?.weight_unit || 'kg');

  const getInitialWeight = () => {
    const kg = user?.weight;
    if (!kg) return '';
    const unit = user?.weight_unit || 'kg';
    if (unit === 'lbs') return String(Math.round(kg * 2.20462 * 10) / 10);
    if (unit === 'stone') return String(Math.round((kg / 6.35029) * 10) / 10);
    return String(kg);
  };
  const [weight, setWeight] = useState(getInitialWeight());
  const [countryCode, setCountryCode] = useState(user?.country_code || '');
  const [countryName, setCountryName] = useState(user?.country || '');
  const [city, setCity] = useState(user?.location || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferred_language || 'en');
  const [fitnessLevel, setFitnessLevel] = useState(user?.fitness_level || '');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const fitnessLevels = [
    { id: 'beginner', label: 'Beginner', description: 'New to working out' },
    { id: 'intermediate', label: 'Intermediate', description: '1-3 years experience' },
    { id: 'advanced', label: 'Advanced', description: '3+ years experience' },
  ];

  const getHeightInCm = () => {
    if (heightUnit === 'cm') return parseFloat(heightCm) || 0;
    const feet = parseInt(heightFeet) || 0;
    const inches = parseInt(heightInches) || 0;
    return Math.round(feet * 30.48 + inches * 2.54);
  };

  const getWeightInKg = () => {
    const w = parseFloat(weight) || 0;
    if (weightUnit === 'kg') return w;
    if (weightUnit === 'lbs') return Math.round(w * 0.453592 * 10) / 10;
    if (weightUnit === 'stone') return Math.round(w * 6.35029 * 10) / 10;
    return w;
  };

  const LANG_BY_COUNTRY: Record<string, string> = {
    GB: 'en', US: 'en-US', FR: 'fr', DE: 'de', ES: 'es', IT: 'it',
    PT: 'pt', NL: 'nl', PL: 'pl', RU: 'ru', AR: 'ar', SA: 'ar',
    AE: 'ar', IN: 'hi', CN: 'zh', JP: 'ja', KR: 'ko', TR: 'tr',
    TH: 'th', VN: 'vi', BR: 'pt', IE: 'en',
  };

  const showLanguageSuggestion = (detectedCode: string) => {
    const suggestedLang = LANG_BY_COUNTRY[detectedCode];
    if (!suggestedLang || suggestedLang === preferredLanguage) return;
    const langItem = LANGUAGES.find((l) => l.code === suggestedLang);
    if (!langItem) return;
    Alert.alert(
      t('language_suggestion_title'),
      t('language_suggestion_msg', { language: langItem.nativeName || langItem.name }),
      [
        { text: t('keep_current'), style: 'cancel' },
        { text: t('switch_language'), onPress: () => setPreferredLanguage(suggestedLang) },
      ]
    );
  };

  const handleCountryCodeChange = (newCode: string) => {
    setCountryCode(newCode);
    const matched = COUNTRIES.find((c) => c.code === newCode);
    if (matched) setCountryName(matched.name);
    showLanguageSuggestion(newCode);
  };

  const detectLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permission_denied'), t('location_permission_msg'));
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;

      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { 'User-Agent': 'ForgeFitApp/1.0' } }
      );
      const data = await resp.json();
      const address = data.address || {};

      const cityValue = address.city || address.town || address.village || address.county || '';
      const countryNameValue = address.country || '';
      const countryCodeValue = (address.country_code || '').toUpperCase();

      if (cityValue) setCity(cityValue);
      if (countryNameValue) setCountryName(countryNameValue);
      if (countryCodeValue) {
        setCountryCode(countryCodeValue);
        const matchedCountry = COUNTRIES.find((c) => c.code === countryCodeValue);
        if (matchedCountry) setCountryName(matchedCountry.name);
        showLanguageSuggestion(countryCodeValue);
      }
    } catch (err) {
      Alert.alert(t('error'), t('location_error_msg'));
    } finally {
      setLocating(false);
    }
  };

  const handleContinue = async () => {
    if (!dobDay || !dobMonth || !dobYear) {
      Alert.alert('Required Fields', 'Please enter your date of birth');
      return;
    }
    if (!computedAge || computedAge < 13) {
      Alert.alert('Invalid Date', 'Please enter a valid date of birth');
      return;
    }
    if (!fitnessLevel) {
      Alert.alert('Required Fields', 'Please select your fitness level');
      return;
    }
    if (heightUnit === 'cm' && !heightCm) {
      Alert.alert('Required Fields', 'Please enter your height');
      return;
    }
    if (heightUnit === 'ft_in' && (!heightFeet || !heightInches)) {
      Alert.alert('Required Fields', 'Please enter your height');
      return;
    }
    if (!weight) {
      Alert.alert('Required Fields', 'Please enter your weight');
      return;
    }

    setLoading(true);
    try {
      const weightInKg = getWeightInKg();
      await updateProfile({
        age: computedAge,
        dob: dobStr,
        height: getHeightInCm(),
        height_unit: heightUnit,
        height_feet: heightUnit === 'ft_in' ? parseInt(heightFeet) : undefined,
        height_inches: heightUnit === 'ft_in' ? parseInt(heightInches) : undefined,
        weight: weightInKg,
        weight_unit: weightUnit,
        country: countryName,
        country_code: countryCode,
        location: city,
        preferred_language: preferredLanguage,
        fitness_level: fitnessLevel,
        starting_weight: weightInKg,
        onboarding_step: 1,
      } as any);
      router.push('/onboarding/goals');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <ForgeVideoBackground />

      <View style={styles.contentLayer}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  Alert.alert(
                    t('cancel_setup'),
                    t('cancel_setup_msg'),
                    [
                      { text: t('stay'), style: 'cancel' },
                      {
                        text: t('log_out'),
                        style: 'destructive',
                        onPress: () => { logout(); router.replace('/'); },
                      },
                    ]
                  );
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '20%' }]} />
            </View>
            <View style={styles.header}>
              <Text style={styles.step}>{t('step1')}</Text>
              <Text style={styles.title}>{t('lets_know_you')}</Text>
              <Text style={styles.subtitle}>{t('profile_subtitle')}</Text>
            </View>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.form}>
                <Text style={styles.sectionTitleStandalone}>Date of Birth *</Text>
                <Text style={styles.hint}>
                  Format: DD / MM / YYYY &nbsp;·&nbsp; Age auto-calculated
                </Text>

                <View style={styles.dobRow}>
                  <View style={styles.dobDay}>
                    <Input
                      placeholder="DD"
                      value={dobDay}
                      onChangeText={(v) => {
                        const n = v.replace(/\D/g, '').slice(0, 2);
                        setDobDay(n);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.dobMonth}>
                    <Input
                      placeholder="MM"
                      value={dobMonth}
                      onChangeText={(v) => {
                        const n = v.replace(/\D/g, '').slice(0, 2);
                        setDobMonth(n);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.dobYear}>
                    <Input
                      placeholder="YYYY"
                      value={dobYear}
                      onChangeText={(v) => {
                        const n = v.replace(/\D/g, '').slice(0, 4);
                        setDobYear(n);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {computedAge !== null && (
                  <View style={styles.agePill}>
                    <Ionicons name="checkmark-circle" size={16} color={BRAND_GREEN} />
                    <Text style={styles.agePillText}>Age: {computedAge} years old</Text>
                  </View>
                )}

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
                  <Input placeholder="Height in cm" value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" icon="resize-outline" />
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

                <View style={styles.locationHeader}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <TouchableOpacity
                    style={styles.detectBtn}
                    onPress={detectLocation}
                    disabled={locating}
                  >
                    {locating ? (
                      <ActivityIndicator size="small" color={BRAND_GREEN} />
                    ) : (
                      <Ionicons name="navigate" size={14} color={BRAND_GREEN} />
                    )}
                    <Text style={styles.detectBtnText}>
                      {locating ? 'Detecting...' : 'Auto-detect'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <SelectPicker
                  placeholder={t('select_country')}
                  value={countryCode}
                  items={countryItems}
                  onSelect={(val) => {
                    handleCountryCodeChange(val);
                  }}
                  icon="globe-outline"
                />

                <Input
                  placeholder={t('enter_city')}
                  value={city}
                  onChangeText={setCity}
                  icon="location-outline"
                />

                <SelectPicker
                  label="Preferred Language"
                  placeholder="Select your language"
                  value={preferredLanguage}
                  items={languageItems}
                  onSelect={(val) => setPreferredLanguage(val)}
                  icon="language-outline"
                />

                <Text style={styles.langHint}>
                  The AI coach will use this language for voice coaching during workouts
                </Text>

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
                      {fitnessLevel === level.id && <Ionicons name="checkmark-circle" size={24} color={BRAND_GREEN} />}
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
  root: { flex: 1, backgroundColor: '#000' },
  contentLayer: { ...StyleSheet.absoluteFillObject, zIndex: 2, elevation: 2 },
  safeArea: { flex: 1 },
  headerSection: { padding: 24, paddingBottom: 0 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 8 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, marginBottom: 24 },
  progressFill: { height: '100%', backgroundColor: '#76FF00', borderRadius: 2 },
  header: { marginBottom: 16 },
  step: { color: '#76FF00', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888' },
  form: { flex: 1 },
  hint: { color: '#666', fontSize: 12, marginBottom: 12 },
  dobRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dobDay: { flex: 1 },
  dobMonth: { flex: 1 },
  dobYear: { flex: 1.5 },
  agePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(118,255,0,0.1)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16, alignSelf: 'flex-start' },
  agePillText: { color: BRAND_GREEN, fontSize: 13, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  sectionTitleStandalone: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  unitToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 2 },
  unitButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  unitButtonActive: { backgroundColor: '#76FF00' },
  unitButtonText: { color: '#888', fontSize: 12, fontWeight: '600' },
  unitButtonTextActive: { color: '#000' },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  locationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  detectBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(118,255,0,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(118,255,0,0.25)' },
  detectBtnText: { color: BRAND_GREEN, fontSize: 12, fontWeight: '600' },
  langHint: { color: '#555', fontSize: 12, marginTop: -8, marginBottom: 16, lineHeight: 18 },
  optionsContainer: { gap: 12, marginBottom: 24 },
  optionCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.12)' },
  optionCardSelected: { borderColor: '#76FF00', backgroundColor: 'rgba(118,255,0,0.08)' },
  optionContent: { flex: 1 },
  optionLabel: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  optionLabelSelected: { color: '#76FF00' },
  optionDescription: { color: '#888', fontSize: 14 },
  continueButton: { marginTop: 'auto' },
});
