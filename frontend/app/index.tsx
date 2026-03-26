import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
<<<<<<< HEAD
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../src/store/authStore';
import { Button } from '../src/components/Button';
=======
import { useAuthStore } from '../src/store/authStore';
import { Button } from '../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');
const MESH_HEIGHT = 260;
const COLS = 14;
const ROWS = 10;

function buildWavePaths(w: number, phase: number): string[] {
  const paths: string[] = [];
  const horizon = MESH_HEIGHT * 0.08;
  const bottom = MESH_HEIGHT;

  // Precompute Y position for each row at each column sample
  const samples = 40;
  const grid: number[][] = [];

  for (let row = 0; row < ROWS; row++) {
    const t = row / (ROWS - 1);
    const tSq = t * t;
    const yBase = horizon + (bottom - horizon) * tSq;
    const amp = 6 + 14 * t;
    const freq = 1.5 + 0.8 * (1 - t);
    const rowPhaseOffset = row * 0.3;

    const rowPts: number[] = [];
    for (let s = 0; s <= samples; s++) {
      const xNorm = s / samples;
      const y = yBase + amp * Math.sin(xNorm * freq * Math.PI * 2 + phase + rowPhaseOffset);
      rowPts.push(y);
    }
    grid.push(rowPts);
  }

  // Horizontal wave lines
  for (let row = 0; row < ROWS; row++) {
    let d = `M 0 ${grid[row][0].toFixed(1)}`;
    for (let s = 1; s <= samples; s++) {
      const x = (s / samples) * w;
      d += ` L ${x.toFixed(1)} ${grid[row][s].toFixed(1)}`;
    }
    paths.push(d);
  }

  // Vertical connecting lines
  for (let col = 0; col <= COLS; col++) {
    const sIdx = Math.round((col / COLS) * samples);
    const x = (col / COLS) * w;
    let d = `M ${x.toFixed(1)} ${grid[0][sIdx].toFixed(1)}`;
    for (let row = 1; row < ROWS; row++) {
      d += ` L ${x.toFixed(1)} ${grid[row][sIdx].toFixed(1)}`;
    }
    paths.push(d);
  }

  return paths;
}

function WaveMesh({ width }: { width: number }) {
  const phaseRef = useRef(0);
  const [paths, setPaths] = useState<string[]>(() => buildWavePaths(width, 0));
  const rafRef = useRef<any>(null);
  const lastRef = useRef<number>(0);

  const tick = useCallback((now: number) => {
    if (now - lastRef.current > 40) {
      phaseRef.current += 0.04;
      setPaths(buildWavePaths(width, phaseRef.current));
      lastRef.current = now;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [width]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    } else {
      const id = setInterval(() => {
        phaseRef.current += 0.04;
        setPaths(buildWavePaths(width, phaseRef.current));
      }, 40);
      return () => clearInterval(id);
    }
  }, [tick]);

  return (
    <Svg width={width} height={MESH_HEIGHT} style={{ position: 'absolute', bottom: 0 }}>
      <Defs>
        <SvgGradient id="meshGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#00CC66" stopOpacity="0.05" />
          <Stop offset="40%" stopColor="#00CC66" stopOpacity="0.35" />
          <Stop offset="100%" stopColor="#00FF88" stopOpacity="0.7" />
        </SvgGradient>
      </Defs>
      {paths.map((d, i) => {
        const isHorizontal = i < ROWS;
        const rowT = isHorizontal ? i / (ROWS - 1) : 0.5;
        const opacity = isHorizontal ? 0.12 + rowT * 0.55 : 0.1 + rowT * 0.2;
        return (
          <Path
            key={i}
            d={d}
            stroke="#00CC66"
            strokeWidth={isHorizontal ? 0.8 + rowT * 0.8 : 0.5}
            strokeOpacity={opacity}
            fill="none"
          />
        );
      })}
    </Svg>
  );
}
>>>>>>> 759a303 (Redesign the home page with a new visual theme and animated elements)

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
<<<<<<< HEAD
=======
  const [meshWidth, setMeshWidth] = useState(SCREEN_W);
>>>>>>> 759a303 (Redesign the home page with a new visual theme and animated elements)

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
<<<<<<< HEAD
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
=======
  }, [isAuthenticated, user, isLoading]);

  return (
    <View
      style={styles.container}
      onLayout={e => setMeshWidth(e.nativeEvent.layout.width)}
    >
      {/* Wave mesh anchored at bottom */}
      <View style={styles.meshContainer} pointerEvents="none">
        <WaveMesh width={meshWidth} />
      </View>
>>>>>>> 759a303 (Redesign the home page with a new visual theme and animated elements)

      {/* Bottom black gradient fade for button readability */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)', '#000000']}
        locations={[0, 0.45, 0.8, 1]}
        style={styles.bottomFade}
      />

      {/* Main UI */}
      <View style={styles.content}>
<<<<<<< HEAD
=======
        {/* Logo as the title — no circle, no text */}
>>>>>>> 759a303 (Redesign the home page with a new visual theme and animated elements)
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
<<<<<<< HEAD

          <Text style={styles.title}>
            FORGE<Text style={styles.green}>FIT</Text>
          </Text>

          <Text style={styles.subtitle}>
            Build Your Strength. Forge Your Body.
          </Text>
        </View>

=======
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Build Your Strength. Forge Your Body.</Text>

        {/* Features */}
>>>>>>> 759a303 (Redesign the home page with a new visual theme and animated elements)
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="sparkles" size={20} color="#3a9c64" />
            <Text style={styles.featureText}>AI Generated Workouts</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={20} color="#3a9c64" />
            <Text style={styles.featureText}>Track Strength Progression</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="barbell" size={20} color="#3a9c64" />
            <Text style={styles.featureText}>Train With Your Equipment</Text>
          </View>
        </View>

<<<<<<< HEAD
=======
        {/* Buttons */}
>>>>>>> 759a303 (Redesign the home page with a new visual theme and animated elements)
        <View style={styles.buttonContainer}>
          <Button
            title="START FORGING"
            onPress={() => router.push('/auth/register')}
            size="large"
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
          <Button
            title="LOG IN"
            onPress={() => router.push('/auth/login')}
            variant="outline"
            size="large"
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
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
=======
    backgroundColor: '#080808',
  },

  meshContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MESH_HEIGHT,
>>>>>>> 759a303 (Redesign the home page with a new visual theme and animated elements)
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 67 : 0,
    paddingBottom: Platform.OS === 'web' ? 34 : 0,
    justifyContent: 'center',
  },

  logoContainer: {
    alignItems: 'center',
<<<<<<< HEAD
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
=======
    marginBottom: 20,
  },

  logo: {
    width: 220,
    height: 220,
  },

  tagline: {
    fontSize: 13,
    color: '#4a4a4a',
    textAlign: 'center',
    letterSpacing: 1.2,
    marginBottom: 44,
  },

  featuresContainer: {
    marginBottom: 44,
    gap: 10,
>>>>>>> 759a303 (Redesign the home page with a new visual theme and animated elements)
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
<<<<<<< HEAD
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.16)',
  },

  featureText: {
    color: '#FFFFFF',
    fontSize: 15,
=======
    backgroundColor: '#111111',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },

  featureText: {
    color: '#5a5a5a',
    fontSize: 14,
>>>>>>> 759a303 (Redesign the home page with a new visual theme and animated elements)
    fontWeight: '500',
  },

  buttonContainer: {
    gap: 12,
  },

  primaryButton: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3a2e',
  },

  primaryButtonText: {
    color: '#3a9c64',
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  secondaryButton: {
    width: '100%',
<<<<<<< HEAD
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#00FF88',
=======
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
>>>>>>> 759a303 (Redesign the home page with a new visual theme and animated elements)
  },

  secondaryButtonText: {
    color: '#3a3a3a',
    letterSpacing: 1,
  },
});
