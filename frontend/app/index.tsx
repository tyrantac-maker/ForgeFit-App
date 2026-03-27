import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
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
          colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.9)', '#000']}
          locations={[0, 0.4, 0.72, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* ── Layer 2: All UI, anchored to the bottom ── */}
      <View style={styles.contentLayer}>

        {/* Logo image — fixed height so it never overflows */}
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Subtitle sits directly under the FORGEFIT text in the image */}
        <Text style={styles.subtitle}>
          Build Your Strength. Forge Your Body.
        </Text>

        {/* Feature highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="sparkles" size={18} color={BRAND_GREEN} />
            <Text style={styles.featureText}>AI Generated Workouts</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={18} color={BRAND_GREEN} />
            <Text style={styles.featureText}>Track Strength Progression</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="barbell" size={18} color={BRAND_GREEN} />
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

  /* Content anchored to the bottom — video shows above it */
  contentLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    elevation: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 36,
  },

  /* Logo: fixed height of 200 keeps it visible without overflowing */
  logo: {
    width: '70%',
    height: 200,
    marginBottom: 0,
  },

  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginBottom: 22,
    marginTop: 2,
  },

  featuresContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.50)',
    borderWidth: 1,
    borderColor: 'rgba(118,255,0,0.22)',
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  buttonContainer: {
    width: '100%',
    gap: 11,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#76FF00',
    borderRadius: 14,
    paddingVertical: 17,
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
    paddingVertical: 16,
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
