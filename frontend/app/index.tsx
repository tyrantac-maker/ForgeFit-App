import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';

import { useAuthStore } from '../src/store/authStore';

const BRAND_GREEN = '#76FF00';
const VIDEO_MODULE = require('../assets/forge-bg.mp4');
const { height: SCREEN_H } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

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
    <View style={styles.root}>

      {/* ── Layer 0: Video background ── */}
      <View style={styles.videoLayer} pointerEvents="none">
        <VideoView
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
      </View>

      {/* ── Layer 1: Dark overlay + gradient ── */}
      <View style={styles.overlayLayer} pointerEvents="none">
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.88)', '#000']}
          locations={[0, 0.38, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* ── Layer 2: Full-screen UI ── */}
      <View style={styles.contentLayer}>

        {/* Top section — logo fills upper portion */}
        <View style={styles.logoSection}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Bottom section — subtitle + features + buttons */}
        <View style={styles.bottomSection}>
          <Text style={styles.subtitle}>
            Build Your Strength. Forge Your Body.
          </Text>

          {/* Feature rows — plain, no card background */}
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

          {/* CTA buttons */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },

  videoLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    elevation: 0,
  },

  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    elevation: 1,
  },

  contentLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    elevation: 2,
    flexDirection: 'column',
  },

  /* Logo fills ~55% of the screen height */
  logoSection: {
    height: SCREEN_H * 0.55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '85%',
    height: '100%',
  },

  /* Everything below the logo */
  bottomSection: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 32,
    justifyContent: 'flex-end',
  },

  subtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 20,
  },

  featuresContainer: {
    width: '100%',
    gap: 14,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
  },

  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#76FF00',
    borderRadius: 30,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  secondaryButton: {
    width: '100%',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#76FF00',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#76FF00',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
});
