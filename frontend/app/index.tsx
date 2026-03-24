import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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
      // Check if onboarding is complete
      if (user.profile_complete) {
        router.replace('/(tabs)');
      } else {
        // Route to appropriate onboarding step
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
      colors={['#0A0A0A', '#1A1A1A', '#0A0A0A']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconWrapper}>
            <Ionicons name="fitness" size={60} color="#FF6B35" />
          </View>
          <Text style={styles.title}>ForgeFit</Text>
          <Text style={styles.subtitle}>Your AI-Powered Personal Trainer</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="sparkles" size={24} color="#FF6B35" />
            <Text style={styles.featureText}>AI-Generated Workouts</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={24} color="#FF6B35" />
            <Text style={styles.featureText}>Smart Progress Tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="body" size={24} color="#FF6B35" />
            <Text style={styles.featureText}>Personalized to Your Goals</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={() => router.push('/auth/register')}
            size="large"
            style={styles.button}
          />
          <Button
            title="I Already Have an Account"
            onPress={() => router.push('/auth/login')}
            variant="outline"
            size="large"
            style={styles.button}
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
    marginBottom: 48,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 48,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
