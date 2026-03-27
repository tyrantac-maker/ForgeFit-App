import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../src/store/authStore';
import { Button } from '../src/components/Button';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.profile_complete) {
        router.replace('/(tabs)');
      } else {
        const step = user.onboarding_step || 0;
        const routes = [
          'onboarding/profile',
          'onboarding/goals',
          'onboarding/location',
          'onboarding/equipment',
          'onboarding/schedule',
        ];

        if (step < routes.length) {
          router.replace(`/${routes[step]}` as any);
        } else {
          router.replace('/(tabs)');
        }
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  return (
    <View style={styles.container}>
      {/* Background video */}
      <Video
        source={require('../assets/forge-bg.mp4')}
        style={StyleSheet.absoluteFillObject}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />

      {/* Main dark overlay */}
      <View style={styles.overlay} />

      {/* Bottom black gradient fade for button readability */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)', '#000000']}
        locations={[0, 0.45, 0.8, 1]}
        style={styles.bottomFade}
      />

      {/* Main UI */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>
            FORGE<Text style={styles.green}>FIT</Text>
          </Text>

          <Text style={styles.subtitle}>
            Build Your Strength. Forge Your Body.
          </Text>
        </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },

  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 260,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 42,
  },

  logo: {
    width: 180,
    height: 180,
    marginBottom: 18,
  },

  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },

  green: {
    color: '#00FF88',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#B5B5B5',
    textAlign: 'center',
    letterSpacing: 0.6,
  },

  featuresContainer: {
    gap: 14,
    marginBottom: 42,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.16)',
  },

  featureText: {
    color: '#FFFFFF',
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
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#00FF88',
  },
});
