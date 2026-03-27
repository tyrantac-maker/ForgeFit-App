import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useWorkoutStore, Workout } from '../../src/store/workoutStore';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';

export default function WorkoutsScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { workouts, fetchWorkouts, generateAIWorkout, deleteWorkout, isLoading } = useWorkoutStore();

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(45);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [longPressId, setLongPressId] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchWorkouts(token);
  }, [token]);

  const focusOptions = [
    { id: 'muscle_gain', label: 'Muscle', icon: 'barbell-outline' },
    { id: 'strength', label: 'Strength', icon: 'fitness-outline' },
    { id: 'fat_loss', label: 'Fat Loss', icon: 'flame-outline' },
    { id: 'conditioning', label: 'Cardio', icon: 'pulse-outline' },
  ];

  const toggleFocus = (id: string) =>
    setSelectedFocus((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

  const handleGenerateWorkout = async () => {
    if (!token) return;
    setGenerating(true);
    try {
      const workout = await generateAIWorkout(token, {
        duration_minutes: selectedDuration,
        focus_areas: selectedFocus.length > 0 ? selectedFocus : undefined,
      });
      setShowGenerateModal(false);
      router.push(`/workout/${workout.id}` as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate workout');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = (workout: Workout) => {
    setLongPressId(null);
    Alert.alert(
      'Delete Workout',
      `Delete "${workout.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            try {
              await deleteWorkout(token, workout.id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (workout: Workout) => {
    setLongPressId(null);
    router.push({ pathname: '/workout/edit', params: { id: workout.id } } as any);
  };

  const getWorkoutTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      full_body: 'body-outline', upper: 'chevron-up-outline', lower: 'chevron-down-outline',
      push: 'arrow-forward-outline', pull: 'arrow-back-outline', legs: 'footsteps-outline', custom: 'create-outline',
    };
    return icons[type] || 'barbell-outline';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateMenu(true)}>
          <Ionicons name="add" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionCard} onPress={() => { setShowCreateMenu(false); router.push('/workout/create' as any); }}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(118,255,0,0.1)' }]}>
              <Ionicons name="create-outline" size={24} color="#76FF00" />
            </View>
            <Text style={styles.actionLabel}>Custom</Text>
            <Text style={styles.actionSub}>Build from library</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => setShowGenerateModal(true)}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(118,255,0,0.1)' }]}>
              <Ionicons name="sparkles" size={24} color="#76FF00" />
            </View>
            <Text style={styles.actionLabel}>AI Workout</Text>
            <Text style={styles.actionSub}>Generated for you</Text>
          </TouchableOpacity>
        </View>

        {isLoading && workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color="#76FF00" />
          </View>
        ) : workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={64} color="#333" />
            <Text style={styles.emptyTitle}>No Workouts Yet</Text>
            <Text style={styles.emptyText}>Create a custom workout or generate one with AI</Text>
          </View>
        ) : (
          <View style={styles.workoutsList}>
            <Text style={styles.sectionTitle}>Your Workouts</Text>
            {workouts.map((workout) => (
              <TouchableOpacity
                key={workout.id}
                activeOpacity={0.8}
                onPress={() => {
                  if (longPressId === workout.id) {
                    setLongPressId(null);
                  } else {
                    router.push(`/workout/${workout.id}` as any);
                  }
                }}
                onLongPress={() => setLongPressId(longPressId === workout.id ? null : workout.id)}
              >
                <Card style={[styles.workoutCard, longPressId === workout.id && styles.workoutCardSelected]}>
                  <View style={styles.workoutHeader}>
                    <View style={[styles.workoutIcon, workout.ai_generated && styles.workoutIconAI]}>
                      <Ionicons
                        name={workout.ai_generated ? 'sparkles' : getWorkoutTypeIcon(workout.workout_type) as any}
                        size={22}
                        color={workout.ai_generated ? '#76FF00' : '#888'}
                      />
                    </View>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutName}>{workout.name}</Text>
                      <Text style={styles.workoutMeta}>
                        {workout.exercises?.length || 0} exercises • {workout.estimated_duration} min
                      </Text>
                    </View>
                    {longPressId !== workout.id && <Ionicons name="chevron-forward" size={20} color="#444" />}
                  </View>

                  {longPressId === workout.id && (
                    <View style={styles.quickActions}>
                      <TouchableOpacity style={styles.qaBtn} onPress={() => router.push(`/workout/${workout.id}` as any)}>
                        <Ionicons name="play-outline" size={16} color="#76FF00" />
                        <Text style={styles.qaBtnText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.qaBtn} onPress={() => handleEdit(workout)}>
                        <Ionicons name="create-outline" size={16} color="#76FF00" />
                        <Text style={styles.qaBtnText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.qaBtn, styles.qaBtnDelete]} onPress={() => handleDelete(workout)}>
                        <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                        <Text style={[styles.qaBtnText, { color: '#FF6B6B' }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {workout.day_of_week && longPressId !== workout.id && (
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>{workout.day_of_week}</Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showGenerateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGenerateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate AI Workout</Text>
              <TouchableOpacity onPress={() => setShowGenerateModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Duration</Text>
            <View style={styles.durationOptions}>
              {[30, 45, 60, 75].map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[styles.durationChip, selectedDuration === dur && styles.durationChipSelected]}
                  onPress={() => setSelectedDuration(dur)}
                >
                  <Text style={[styles.durationText, selectedDuration === dur && styles.durationTextSelected]}>
                    {dur} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Focus (optional)</Text>
            <View style={styles.focusOptions}>
              {focusOptions.map((focus) => (
                <TouchableOpacity
                  key={focus.id}
                  style={[styles.focusChip, selectedFocus.includes(focus.id) && styles.focusChipSelected]}
                  onPress={() => toggleFocus(focus.id)}
                >
                  <Ionicons name={focus.icon as any} size={18} color={selectedFocus.includes(focus.id) ? '#76FF00' : '#888'} />
                  <Text style={[styles.focusText, selectedFocus.includes(focus.id) && styles.focusTextSelected]}>
                    {focus.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={generating ? 'Generating...' : 'Generate Workout'}
              onPress={handleGenerateWorkout}
              loading={generating}
              disabled={generating}
              style={styles.generateModalButton}
              icon={!generating && <Ionicons name="sparkles" size={20} color="#fff" />}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#76FF00', alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  actionCard: { flex: 1, backgroundColor: '#161616', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#2A2A2A', alignItems: 'flex-start', gap: 6 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  actionLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
  actionSub: { color: '#666', fontSize: 12 },
  sectionTitle: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '600' },
  emptyText: { color: '#666', fontSize: 14, textAlign: 'center', maxWidth: 250 },
  workoutsList: { gap: 10 },
  workoutCard: { padding: 16 },
  workoutCardSelected: { borderColor: '#76FF0033', backgroundColor: 'rgba(118,255,0,0.03)' },
  workoutHeader: { flexDirection: 'row', alignItems: 'center' },
  workoutIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  workoutIconAI: { backgroundColor: 'rgba(118,255,0,0.12)' },
  workoutInfo: { flex: 1 },
  workoutName: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  workoutMeta: { color: '#666', fontSize: 13 },
  quickActions: { flexDirection: 'row', gap: 8, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  qaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(118,255,0,0.08)', borderWidth: 1, borderColor: '#76FF0033' },
  qaBtnDelete: { backgroundColor: 'rgba(255,107,107,0.08)', borderColor: '#FF6B6B33' },
  qaBtnText: { color: '#76FF00', fontSize: 13, fontWeight: '600' },
  dayBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(118,255,0,0.12)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  dayBadgeText: { color: '#76FF00', fontSize: 10, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#161616', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#333', alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  modalLabel: { color: '#888', fontSize: 14, marginBottom: 12 },
  durationOptions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  durationChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#2A2A2A', borderWidth: 2, borderColor: '#2A2A2A' },
  durationChipSelected: { borderColor: '#76FF00', backgroundColor: 'rgba(118,255,0,0.12)' },
  durationText: { color: '#888', fontSize: 14, fontWeight: '600' },
  durationTextSelected: { color: '#76FF00' },
  focusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  focusChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#2A2A2A', borderWidth: 2, borderColor: '#2A2A2A', gap: 8 },
  focusChipSelected: { borderColor: '#76FF00', backgroundColor: 'rgba(118,255,0,0.12)' },
  focusText: { color: '#888', fontSize: 14, fontWeight: '600' },
  focusTextSelected: { color: '#76FF00' },
  generateModalButton: { marginTop: 8 },
});
