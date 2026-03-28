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
import { useTranslation } from '../../src/hooks/useTranslation';

const BRAND_GREEN = '#76FF00';

const GOALS = [
  { id: 'muscle_gain', labelKey: 'build_muscle' as const, icon: 'barbell-outline', descKey: 'increase_muscle' as const },
  { id: 'strength', labelKey: 'get_stronger' as const, icon: 'fitness-outline', descKey: 'improve_strength' as const },
  { id: 'fat_loss', labelKey: 'lose_fat' as const, icon: 'flame-outline', descKey: 'burn_fat' as const },
  { id: 'conditioning', labelKey: 'conditioning' as const, icon: 'pulse-outline', descKey: 'improve_cardio' as const },
  { id: 'endurance', labelKey: 'build_endurance' as const, icon: 'timer-outline', descKey: 'increase_stamina' as const },
  { id: 'calisthenics', labelKey: 'calisthenics' as const, icon: 'body-outline', descKey: 'master_bodyweight' as const },
  { id: 'general_fitness', labelKey: 'general_fitness' as const, icon: 'heart-outline', descKey: 'overall_health' as const },
];

export default function GoalsOnboarding() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const { t } = useTranslation();

  const weightUnit = user?.weight_unit || 'kg';

  const getInitialGoalWeight = () => {
    const kg = user?.goal_weight;
    if (!kg) return '';
    if (weightUnit === 'lbs') return String(Math.round(kg * 2.20462 * 10) / 10);
    if (weightUnit === 'stone') return String(Math.round((kg / 6.35029) * 10) / 10);
    return String(kg);
  };

  const goalWeightToKg = (val: string) => {
    const n = parseFloat(val);
    if (isNaN(n)) return undefined;
    if (weightUnit === 'lbs') return Math.round(n * 0.453592 * 10) / 10;
    if (weightUnit === 'stone') return Math.round(n * 6.35029 * 10) / 10;
    return n;
  };

  const [selectedGoals, setSelectedGoals] = useState<string[]>(user?.goals || []);
  const [goalWeight, setGoalWeight] = useState(getInitialGoalWeight());
  const [loading, setLoading] = useState(false);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) {
      Alert.alert(t('error'), t('select_one_goal'));
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        goals: selectedGoals,
        goal_weight: goalWeight ? goalWeightToKg(goalWeight) : undefined,
        onboarding_step: 2,
      });
      router.push('/onboarding/location');
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('save_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <ForgeVideoBackground />

      <View style={styles.contentLayer}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.canGoBack() ? router.back() : router.replace('/onboarding/profile')}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '40%' }]} />
            </View>

            <View style={styles.header}>
              <Text style={styles.step}>{t('step2')}</Text>
              <Text style={styles.title}>{t('what_are_goals')}</Text>
              <Text style={styles.subtitle}>{t('select_all_apply')}</Text>
            </View>

            <View style={styles.goalsGrid}>
              {GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[styles.goalCard, selectedGoals.includes(goal.id) && styles.goalCardSelected]}
                  onPress={() => toggleGoal(goal.id)}
                >
                  <View style={[
                    styles.goalIconContainer,
                    selectedGoals.includes(goal.id) && styles.goalIconContainerSelected,
                  ]}>
                    <Ionicons
                      name={goal.icon as any}
                      size={28}
                      color={selectedGoals.includes(goal.id) ? BRAND_GREEN : '#888'}
                    />
                  </View>
                  <Text style={[
                    styles.goalLabel,
                    selectedGoals.includes(goal.id) && styles.goalLabelSelected,
                  ]}>
                    {t(goal.labelKey)}
                  </Text>
                  <Text style={styles.goalDescription}>{t(goal.descKey)}</Text>
                  {selectedGoals.includes(goal.id) && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={16} color="#000" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.weightGoalSection}>
              <Text style={styles.sectionTitle}>
                {t('target_weight')} — {weightUnit === 'stone' ? 'st' : weightUnit}
              </Text>
              <Input
                placeholder={`${t('target_weight')} (${weightUnit === 'stone' ? 'stone' : weightUnit})`}
                value={goalWeight}
                onChangeText={setGoalWeight}
                keyboardType="numeric"
                icon="trending-up-outline"
              />
            </View>

            <Button
              title={t('continue')}
              onPress={handleContinue}
              loading={loading}
              size="large"
              disabled={selectedGoals.length === 0}
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
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  goalCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    position: 'relative',
  },
  goalCardSelected: {
    borderColor: '#76FF00',
    backgroundColor: 'rgba(118,255,0,0.08)',
  },
  goalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  goalIconContainerSelected: {
    backgroundColor: 'rgba(118,255,0,0.15)',
  },
  goalLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalLabelSelected: {
    color: '#76FF00',
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
    backgroundColor: '#76FF00',
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
