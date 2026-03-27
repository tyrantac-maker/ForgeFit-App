import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  const player = useVideoPlayer(require('../assets/forge-bg.mp4'), (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

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
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        nativeControls={false}
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
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/auth/register')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>START FORGING</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>LOG IN</Text>
          </TouchableOpacity>
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
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
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
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },

  secondaryButton: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#00FF88',
    backgroundColor: 'transparent',
  },

  secondaryButtonText: {
    color: '#00FF88',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
});
