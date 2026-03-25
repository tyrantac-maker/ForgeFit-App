import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Button } from '../src/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.profile_complete) {
        router.replace('/(tabs)');
      } else {
        const step = user.onboarding_step || 0;
        const routes = ['onboarding/profile', 'onboarding/goals', 'onboarding/location', 'onboarding/equipment', 'onboarding/schedule'];
        if (step < routes.length) {
          router.replace(`/${routes[step]}` as any);
        } else {
          router.replace('/(tabs)');
        }
      }
    }
  }, [isAuthenticated, user, isLoading]);

  return (
    <LinearGradient
      colors={['#000000', '#050505', '#000000']}
      style={styles.container}
    >
      <View style={styles.content}>

        {/* LOGO + BRAND */}
        <View style={styles.logoContainer}>
          <View style={styles.iconWrapper}>
            <Ionicons name="fitness" size={64} color="#00FF88" />
          </View>

          <Text style={styles.title}>
            FORGE<Text style={styles.green}>FIT</Text>
          </Text>

          <Text style={styles.subtitle}>
            Build Your Strength. Forge Your Body.
          </Text>
        </View>

        {/* FEATURES */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="sparkles" size={22} color="#00FF88" />
            <Text style={styles.featureText}>AI Generated Workouts</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={22} color="#00FF88" />
            <Text style={styles.featureText}>Track Strength Progression</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="barbell" size={22} color="#00FF88" />
            <Text style={styles.featureText}>Train With Your Equipment</Text>
          </View>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          <Button
            title="START FORGING"
            onPress={() => router.push('/auth/register')}
            size="large"
            style={styles.primaryButton}
          />

          <Button
            title="LOG IN"
            onPress={() => router.push('/auth/login')}
            variant="outline"
            size="large"
            style={styles.secondaryButton}
          />
        </View>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },

  iconWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(0,255,136,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(0,255,136,0.4)',
    shadowColor: '#00FF88',
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },

  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },

  green: {
    color: '#00FF88',
  },

  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
  },

  featuresContainer: {
    marginBottom: 50,
    gap: 14,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.15)',
  },

  featureText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },

  buttonContainer: {
    gap: 14,
  },

  primaryButton: {
    width: '100%',
    backgroundColor: '#00FF88',
    borderRadius: 14,
  },

  secondaryButton: {
    width: '100%',
    borderColor: '#00FF88',
    borderWidth: 1.5,
    borderRadius: 14,
  },
});