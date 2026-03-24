import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import * as Linking from 'expo-linking';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { exchangeSession } = useAuthStore();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use ref to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      try {
        // Get session_id from URL params or hash
        let sessionId = params.session_id as string;
        
        if (!sessionId) {
          // Try to get from current URL
          const url = await Linking.getInitialURL();
          if (url) {
            const hashPart = url.split('#')[1];
            if (hashPart) {
              const hashParams = new URLSearchParams(hashPart);
              sessionId = hashParams.get('session_id') || '';
            }
          }
        }

        if (sessionId) {
          await exchangeSession(sessionId);
          router.replace('/');
        } else {
          console.log('No session_id found');
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/auth/login');
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#888',
    fontSize: 16,
    marginTop: 16,
  },
});
