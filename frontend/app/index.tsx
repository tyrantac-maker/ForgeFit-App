import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';

import { useAuthStore } from '../src/store/authStore';

const BRAND_GREEN = '#76FF00';
const VIDEO_MODULE = require('../assets/forge-bg.mp4');

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [videoReady, setVideoReady] = useState(false);

  const player = useVideoPlayer(null, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    let mounted = true;
    async function loadVideo() {
      try {
        const asset = Asset.fromModule(VIDEO_MODULE);
        await asset.downloadAsync();
        const uri = asset.localUri ?? asset.uri;
        if (mounted && uri) {
          player.replace({ uri });
          player.play();
          setVideoReady(true);
        }
      } catch (e) {
        console.warn('Video load failed:', e);
      }
    }
    loadVideo();
    return () => { mounted = false; };
  }, []);

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
      {/* Background video — shown once asset is loaded */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />

      {/* Dark overlay */}
      <View style={styles.overlay} />

      {/* Bottom gradient fade */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.88)', '#000']}
        locations={[0, 0.4, 0.75, 1]}
        style={styles.bottomFade}
      />

      {/* Main UI */}
      <View style={styles.content}>

        {/* Logo image — FORGEFIT text is inside the image */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Feature highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="sparkles" size={20} color={BRAND_GREEN} />
            <Text style={styles.featureText}>AI Generated Workouts</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={20} color={BRAND_GREEN} />
            <Text style={styles.featureText}>Track Strength Progression</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="barbell" size={20} color={BRAND_GREEN} />
            <Text style={styles.featureText}>Train With Your Equipment</Text>
          </View>
        </View>

        {/* Buttons */}
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
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logo: {
    width: '88%',
    aspectRatio: 1,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 36,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 15,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(118,255,0,0.18)',
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#76FF00',
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
    borderColor: '#76FF00',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#76FF00',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
});
