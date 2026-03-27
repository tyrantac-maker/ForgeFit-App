import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useWorkoutStore } from '../../src/store/workoutStore';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuthStore();
  const { workouts, fetchWorkouts, startSession, deleteWorkout } = useWorkoutStore();

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const workout = workouts.find((w) => w.id === id);

  const weightUnit = user?.weight_unit === 'lbs' ? 'lbs' : user?.weight_unit === 'stone' ? 'st' : 'kg';

  useEffect(() => {
    if (!workout && token) {
      fetchWorkouts(token);
    }
  }, [token, id]);

  const handleStartWorkout = async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const session = await startSession(token, id);
      router.push({
        pathname: '/workout/session',
        params: { sessionId: session.id, workoutId: id },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start workout');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push({ pathname: '/workout/edit', params: { id } } as any);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${workout?.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!token || !id) return;
            setDeleting(true);
            try {
              await deleteWorkout(token, id);
              router.replace('/(tabs)/workouts' as any);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete workout');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          {workout.ai_generated && (
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={14} color="#76FF00" />
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          )}
          <TouchableOpacity style={styles.iconBtn} onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color="#76FF00" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]} onPress={handleDelete} disabled={deleting}>
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{workout.name}</Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="barbell-outline" size={18} color="#888" />
              <Text style={styles.metaText}>{workout.exercises?.length || 0} exercises</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color="#888" />
              <Text style={styles.metaText}>{workout.estimated_duration} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="fitness-outline" size={18} color="#888" />
              <Text style={styles.metaText}>{workout.workout_type?.replace('_', ' ')}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Exercises</Text>
        <View style={styles.exercisesList}>
          {workout.exercises?.map((exercise, index) => (
            <Card key={exercise.exercise_id || index} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.sets} sets × {exercise.reps} reps
                    {exercise.weight ? ` @ ${exercise.weight}${weightUnit}` : ''}
                  </Text>
                </View>
              </View>
              <View style={styles.exerciseMeta}>
                <View style={styles.restInfo}>
                  <Ionicons name="timer-outline" size={14} color="#666" />
                  <Text style={styles.restText}>
                    {exercise.rest_seconds === 0 ? 'Superset' : `${exercise.rest_seconds}s rest`}
                  </Text>
                </View>
                {exercise.notes && (
                  <Text style={styles.noteText}>{exercise.notes}</Text>
                )}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Start Workout"
          onPress={handleStartWorkout}
          loading={loading}
          size="large"
          icon={<Ionicons name="play" size={20} color="#fff" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#888', fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(118,255,0,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  aiBadgeText: { color: '#76FF00', fontSize: 12, fontWeight: '600' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { backgroundColor: 'rgba(255,107,107,0.1)' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  titleSection: { marginBottom: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 16 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#888', fontSize: 14, textTransform: 'capitalize' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  exercisesList: { gap: 12 },
  exerciseCard: { padding: 16 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  exerciseNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#76FF00', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  exerciseNumberText: { color: '#000', fontSize: 14, fontWeight: '700' },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  exerciseDetails: { color: '#888', fontSize: 14 },
  exerciseMeta: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  restInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  restText: { color: '#666', fontSize: 12 },
  noteText: { color: '#4ECDC4', fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 40, backgroundColor: '#0A0A0A', borderTopWidth: 1, borderTopColor: '#1A1A1A' },
});
