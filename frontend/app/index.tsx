import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');
const MESH_H = 280;
const ROWS = 10;
const COLS = 14;
const SAMPLES = 40;

function buildMesh(w: number, phase: number): { hPaths: string[]; vPaths: string[] } {
  const horizon = MESH_H * 0.05;
  const bottom = MESH_H;

  // Precompute grid points
  const grid: number[][] = [];
  for (let row = 0; row < ROWS; row++) {
    const t = row / (ROWS - 1);
    const yBase = horizon + (bottom - horizon) * (t * t);
    const amp = 4 + 18 * t;
    const freq = 1.4 + 0.6 * (1 - t);
    const rowOffset = row * 0.4;
    const pts: number[] = [];
    for (let s = 0; s <= SAMPLES; s++) {
      const xn = s / SAMPLES;
      pts.push(yBase + amp * Math.sin(xn * freq * Math.PI * 2 + phase + rowOffset));
    }
    grid.push(pts);
  }

  const hPaths: string[] = [];
  for (let row = 0; row < ROWS; row++) {
    let d = `M 0 ${grid[row][0].toFixed(1)}`;
    for (let s = 1; s <= SAMPLES; s++) {
      d += ` L ${((s / SAMPLES) * w).toFixed(1)} ${grid[row][s].toFixed(1)}`;
    }
    hPaths.push(d);
  }

  const vPaths: string[] = [];
  for (let col = 0; col <= COLS; col++) {
    const si = Math.round((col / COLS) * SAMPLES);
    const x = ((col / COLS) * w).toFixed(1);
    let d = `M ${x} ${grid[0][si].toFixed(1)}`;
    for (let row = 1; row < ROWS; row++) {
      d += ` L ${x} ${grid[row][si].toFixed(1)}`;
    }
    vPaths.push(d);
  }

  return { hPaths, vPaths };
}

function WaveMesh({ width }: { width: number }) {
  const phaseRef = useRef(0);
  const [mesh, setMesh] = useState(() => buildMesh(width, 0));
  const rafRef = useRef<any>(null);
  const lastRef = useRef(0);

  const tick = useCallback((now: number) => {
    if (now - lastRef.current > 38) {
      phaseRef.current += 0.035;
      setMesh(buildMesh(width, phaseRef.current));
      lastRef.current = now;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [width]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      rafRef.current = requestAnimationFrame(tick);
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }
    const id = setInterval(() => {
      phaseRef.current += 0.035;
      setMesh(buildMesh(width, phaseRef.current));
    }, 38);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <Svg width={width} height={MESH_H} style={{ position: 'absolute', bottom: 0 }}>
      <Defs>
        <SvgGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#00AA55" stopOpacity="0" />
          <Stop offset="50%" stopColor="#00AA55" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#00CC66" stopOpacity="0.65" />
        </SvgGradient>
      </Defs>
      {mesh.hPaths.map((d, i) => {
        const t = i / (ROWS - 1);
        return (
          <Path
            key={`h${i}`}
            d={d}
            stroke="#00AA55"
            strokeWidth={0.6 + t * 1.0}
            strokeOpacity={0.08 + t * 0.52}
            fill="none"
          />
        );
      })}
      {mesh.vPaths.map((d, i) => (
        <Path
          key={`v${i}`}
          d={d}
          stroke="#00AA55"
          strokeWidth={0.4}
          strokeOpacity={0.12}
          fill="none"
        />
      ))}
    </Svg>
  );
}

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [meshWidth, setMeshWidth] = useState(SCREEN_W);

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
        router.replace(step < routes.length
          ? (`/${routes[step]}` as any)
          : '/(tabs)'
        );
      }
    }
  }, [isAuthenticated, user, isLoading]);

  return (
    <View
      style={styles.container}
      onLayout={e => setMeshWidth(e.nativeEvent.layout.width)}
    >
      {/* 3D Wave mesh anchored at bottom */}
      <View style={styles.meshWrap} pointerEvents="none">
        <WaveMesh width={meshWidth} />
      </View>

      {/* Subtle vignette overlay */}
      <View style={styles.vignette} pointerEvents="none" />

      <View style={styles.content}>

        {/* Logo — no circle, acts as brand title */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Ionicons name="sparkles-outline" size={18} color="#2d6644" />
            <Text style={styles.featureText}>AI Generated Workouts</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="trending-up-outline" size={18} color="#2d6644" />
            <Text style={styles.featureText}>Track Strength Progression</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="barbell-outline" size={18} color="#2d6644" />
            <Text style={styles.featureText}>Train With Your Equipment</Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/auth/register')}
            activeOpacity={0.75}
          >
            <Text style={styles.btnPrimaryText}>START FORGING</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.75}
          >
            <Text style={styles.btnSecondaryText}>LOG IN</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },

  meshWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MESH_H,
  },

  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    shadowColor: '#000',
  },

  content: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: Platform.OS === 'web' ? 60 : 20,
    paddingBottom: Platform.OS === 'web' ? 34 : 16,
    justifyContent: 'center',
  },

  logoWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },

  logo: {
    width: 230,
    height: 230,
  },

  features: {
    marginBottom: 40,
    gap: 10,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: '#101010',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#191919',
  },

  featureText: {
    color: '#3a3a3a',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  btnGroup: {
    gap: 11,
  },

  btnPrimary: {
    backgroundColor: '#121a14',
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e3326',
  },

  btnPrimaryText: {
    color: '#2d8f55',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },

  btnSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1c1c1c',
  },

  btnSecondaryText: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
});
