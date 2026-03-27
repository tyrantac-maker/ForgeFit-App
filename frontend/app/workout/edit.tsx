import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useWorkoutStore } from '../../src/store/workoutStore';
import ExerciseLibrary, { SelectedExercise } from '../../src/components/ExerciseLibrary';

const WORKOUT_TYPES = [
  { id: 'push', label: 'Push' },
  { id: 'pull', label: 'Pull' },
  { id: 'legs', label: 'Legs' },
  { id: 'upper', label: 'Upper' },
  { id: 'lower', label: 'Lower' },
  { id: 'full_body', label: 'Full Body' },
  { id: 'custom', label: 'Custom' },
];

type EditStep = 'details' | 'library' | 'review';

interface EditExerciseModalProps {
  exercise: SelectedExercise | null;
  idx: number;
  visible: boolean;
  onClose: () => void;
  onSave: (idx: number, updated: SelectedExercise) => void;
  weightUnit: string;
}

function EditExerciseModal({ exercise, idx, visible, onClose, onSave, weightUnit }: EditExerciseModalProps) {
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [rest, setRest] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (exercise) {
      setSets(String(exercise.sets));
      setReps(String(exercise.reps));
      setWeight(exercise.weight ? String(exercise.weight) : '');
      setRest(String(exercise.rest_seconds));
      setNotes(exercise.notes || '');
    }
  }, [exercise]);

  if (!exercise) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={em.overlay}>
          <View style={em.sheet}>
            <View style={em.handle} />
            <View style={em.header}>
              <Text style={em.title}>{exercise.exercise_name}</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#888" /></TouchableOpacity>
            </View>

            <View style={em.row}>
              <View style={em.half}>
                <Text style={em.label}>Sets</Text>
                <View style={em.stepper}>
                  <TouchableOpacity onPress={() => setSets(s => String(Math.max(1, parseInt(s||'1') - 1)))} style={em.stepBtn}><Ionicons name="remove" size={18} color="#76FF00" /></TouchableOpacity>
                  <TextInput style={em.stepVal} value={sets} onChangeText={setSets} keyboardType="number-pad" />
                  <TouchableOpacity onPress={() => setSets(s => String((parseInt(s||'0')||0) + 1))} style={em.stepBtn}><Ionicons name="add" size={18} color="#76FF00" /></TouchableOpacity>
                </View>
              </View>
              <View style={em.half}>
                <Text style={em.label}>Reps</Text>
                <View style={em.stepper}>
                  <TouchableOpacity onPress={() => setReps(r => String(Math.max(1, parseInt(r||'1') - 1)))} style={em.stepBtn}><Ionicons name="remove" size={18} color="#76FF00" /></TouchableOpacity>
                  <TextInput style={em.stepVal} value={reps} onChangeText={setReps} keyboardType="number-pad" />
                  <TouchableOpacity onPress={() => setReps(r => String((parseInt(r||'0')||0) + 1))} style={em.stepBtn}><Ionicons name="add" size={18} color="#76FF00" /></TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={em.label}>Weight ({weightUnit}) — blank = bodyweight</Text>
            <TextInput style={em.input} value={weight} onChangeText={setWeight} placeholder="e.g. 60" placeholderTextColor="#444" keyboardType="decimal-pad" />

            <Text style={em.label}>Rest (seconds) — 0 = Superset</Text>
            <View style={em.restRow}>
              {['0','30','45','60','90','120','180'].map(r => (
                <TouchableOpacity key={r} style={[em.restChip, rest === r && em.restChipOn]} onPress={() => setRest(r)}>
                  <Text style={[em.restChipText, rest === r && em.restChipTextOn]}>{r === '0' ? 'SS' : r + 's'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={em.input} value={rest} onChangeText={setRest} placeholder="Custom seconds" placeholderTextColor="#444" keyboardType="number-pad" />

            <Text style={em.label}>Notes (optional)</Text>
            <TextInput style={em.input} value={notes} onChangeText={setNotes} placeholder="e.g. Pause at bottom, wide grip" placeholderTextColor="#444" />

            <TouchableOpacity style={em.saveBtn} onPress={() => {
              onSave(idx, {
                ...exercise,
                sets: Math.max(1, parseInt(sets)||3),
                reps: Math.max(1, parseInt(reps)||10),
                weight: weight ? parseFloat(weight) : undefined,
                rest_seconds: parseInt(rest) ?? 60,
                notes: notes.trim() || undefined,
              });
              onClose();
            }}>
              <Text style={em.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const em = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#161616', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#333', alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: '#fff', fontSize: 17, fontWeight: '700', flex: 1, marginRight: 8 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  half: { flex: 1 },
  label: { color: '#888', fontSize: 12, fontWeight: '500', marginBottom: 8, marginTop: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', borderRadius: 12 },
  stepBtn: { padding: 12 },
  stepVal: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  input: { backgroundColor: '#222', borderRadius: 12, color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 4 },
  restRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  restChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#2A2A2A', borderWidth: 1.5, borderColor: '#2A2A2A' },
  restChipOn: { borderColor: '#76FF00', backgroundColor: 'rgba(118,255,0,0.12)' },
  restChipText: { color: '#666', fontSize: 12, fontWeight: '600' },
  restChipTextOn: { color: '#76FF00' },
  saveBtn: { backgroundColor: '#76FF00', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});

// ─── Main Edit Screen ────────────────────────────────────────────────────────

export default function EditWorkoutScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuthStore();
  const { workouts, fetchWorkouts, updateWorkout } = useWorkoutStore();

  const [step, setStep] = useState<EditStep>('details');
  const [name, setName] = useState('');
  const [workoutType, setWorkoutType] = useState('custom');
  const [duration, setDuration] = useState('45');
  const [exercises, setExercises] = useState<SelectedExercise[]>([]);
  const [saving, setSaving] = useState(false);

  const [editIdx, setEditIdx] = useState<number>(-1);
  const [editTarget, setEditTarget] = useState<SelectedExercise | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const weightUnit = user?.weight_unit === 'lbs' ? 'lbs' : user?.weight_unit === 'stone' ? 'st' : 'kg';
  const addedIds = exercises.map((e) => e.exercise_id);

  useEffect(() => {
    const w = workouts.find((w) => w.id === id);
    if (w) {
      setName(w.name);
      setWorkoutType(w.workout_type);
      setDuration(String(w.estimated_duration));
      setExercises(w.exercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        muscle_group: '',
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        rest_seconds: ex.rest_seconds,
        notes: ex.notes,
      })));
    } else if (token) {
      fetchWorkouts(token);
    }
  }, [id, workouts]);

  const handleAddExercise = (ex: SelectedExercise) => {
    setExercises((prev) => [...prev, ex]);
  };

  const handleRemove = (idx: number) => setExercises((prev) => prev.filter((_, i) => i !== idx));
  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...exercises]; [next[idx-1], next[idx]] = [next[idx], next[idx-1]]; setExercises(next);
  };
  const handleMoveDown = (idx: number) => {
    if (idx === exercises.length - 1) return;
    const next = [...exercises]; [next[idx], next[idx+1]] = [next[idx+1], next[idx]]; setExercises(next);
  };
  const openEdit = (idx: number) => {
    setEditIdx(idx); setEditTarget(exercises[idx]); setShowEditModal(true);
  };
  const handleSaveEdit = (idx: number, updated: SelectedExercise) => {
    setExercises((prev) => prev.map((e, i) => i === idx ? updated : e));
  };

  const handleSave = async () => {
    if (!token || !id) return;
    if (!name.trim()) { Alert.alert('Name Required', 'Workout needs a name.'); return; }
    setSaving(true);
    try {
      const workoutExercises = exercises.map((ex, i) => ({
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        sets: ex.sets, reps: ex.reps,
        weight: ex.weight, rest_seconds: ex.rest_seconds,
        notes: ex.notes, order: i, completed: false,
      }));
      await updateWorkout(token, id, {
        name: name.trim(), workout_type: workoutType,
        exercises: workoutExercises, estimated_duration: parseInt(duration)||45,
        ai_generated: false,
      });
      router.replace(`/workout/${id}` as any);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => {
          if (step === 'library') setStep('details');
          else if (step === 'review') setStep('library');
          else router.back();
        }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Edit Workout</Text>
        <TouchableOpacity style={s.saveTopBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={s.saveTopBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <View style={s.tabBar}>
        {(['details','library','review'] as EditStep[]).map((t) => (
          <TouchableOpacity key={t} style={[s.tab, step === t && s.tabOn]} onPress={() => setStep(t)}>
            <Text style={[s.tabText, step === t && s.tabTextOn]}>
              {t === 'details' ? 'Details' : t === 'library' ? 'Add Exercises' : `Review (${exercises.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {step === 'details' && (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.fieldLabel}>Workout Name</Text>
          <TextInput style={s.nameInput} value={name} onChangeText={setName} placeholder="My Workout" placeholderTextColor="#444" />

          <Text style={s.fieldLabel}>Type</Text>
          <View style={s.typeRow}>
            {WORKOUT_TYPES.map((t) => (
              <TouchableOpacity key={t.id} style={[s.typeChip, workoutType === t.id && s.typeChipOn]} onPress={() => setWorkoutType(t.id)}>
                <Text style={[s.typeChipText, workoutType === t.id && s.typeChipTextOn]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.fieldLabel}>Duration (minutes)</Text>
          <View style={s.durationRow}>
            {['30','45','60','75','90'].map((d) => (
              <TouchableOpacity key={d} style={[s.durChip, duration === d && s.durChipOn]} onPress={() => setDuration(d)}>
                <Text style={[s.durText, duration === d && s.durTextOn]}>{d}m</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={s.customDuration} value={duration} onChangeText={setDuration} placeholder="Custom" placeholderTextColor="#444" keyboardType="number-pad" />
        </ScrollView>
      )}

      {step === 'library' && (
        <View style={{ flex: 1 }}>
          <ExerciseLibrary token={token!} weightUnit={weightUnit} onAdd={handleAddExercise} addedIds={addedIds} />
        </View>
      )}

      {step === 'review' && (
        <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
          {exercises.length === 0 ? (
            <TouchableOpacity style={s.emptyCard} onPress={() => setStep('library')}>
              <Ionicons name="add-circle-outline" size={40} color="#76FF00" />
              <Text style={s.emptyText}>Tap to add exercises</Text>
            </TouchableOpacity>
          ) : (
            exercises.map((ex, idx) => (
              <View key={`${ex.exercise_id}_${idx}`} style={s.exCard}>
                <View style={s.exLeft}>
                  <View style={s.exNum}><Text style={s.exNumText}>{idx + 1}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.exName}>{ex.exercise_name}</Text>
                    <Text style={s.exDetail}>
                      {ex.sets}×{ex.reps}
                      {ex.weight ? ` @ ${ex.weight}${weightUnit}` : ''}
                      {' • '}{ex.rest_seconds === 0 ? 'SS' : `${ex.rest_seconds}s`}
                    </Text>
                    {ex.notes ? <Text style={s.exNotes}>{ex.notes}</Text> : null}
                  </View>
                </View>
                <View style={s.exActions}>
                  <TouchableOpacity style={s.aBtn} onPress={() => handleMoveUp(idx)}>
                    <Ionicons name="chevron-up" size={17} color={idx === 0 ? '#333' : '#888'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.aBtn} onPress={() => handleMoveDown(idx)}>
                    <Ionicons name="chevron-down" size={17} color={idx === exercises.length-1 ? '#333' : '#888'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.aBtn} onPress={() => openEdit(idx)}>
                    <Ionicons name="create-outline" size={17} color="#76FF00" />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.aBtn} onPress={() => handleRemove(idx)}>
                    <Ionicons name="trash-outline" size={17} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <TouchableOpacity style={s.addMoreBtn} onPress={() => setStep('library')}>
            <Ionicons name="add" size={18} color="#76FF00" />
            <Text style={s.addMoreText}>Add More Exercises</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <EditExerciseModal
        exercise={editTarget}
        idx={editIdx}
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
        weightUnit={weightUnit}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', flex: 1 },
  saveTopBtn: { backgroundColor: '#76FF00', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  saveTopBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#2A2A2A', alignItems: 'center' },
  tabOn: { borderColor: '#76FF00', backgroundColor: 'rgba(118,255,0,0.1)' },
  tabText: { color: '#666', fontSize: 12, fontWeight: '600' },
  tabTextOn: { color: '#76FF00' },
  scroll: { padding: 16 },
  fieldLabel: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 10, marginTop: 8 },
  nameInput: { backgroundColor: '#1A1A1A', borderRadius: 14, color: '#fff', paddingHorizontal: 16, paddingVertical: 14, fontSize: 17, borderWidth: 1.5, borderColor: '#2A2A2A', marginBottom: 20 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#2A2A2A' },
  typeChipOn: { borderColor: '#76FF00', backgroundColor: 'rgba(118,255,0,0.08)' },
  typeChipText: { color: '#666', fontSize: 13, fontWeight: '600' },
  typeChipTextOn: { color: '#76FF00' },
  durationRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  durChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#2A2A2A' },
  durChipOn: { borderColor: '#76FF00', backgroundColor: 'rgba(118,255,0,0.1)' },
  durText: { color: '#666', fontSize: 13, fontWeight: '600' },
  durTextOn: { color: '#76FF00' },
  customDuration: { backgroundColor: '#1A1A1A', borderRadius: 12, color: '#fff', paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, borderWidth: 1.5, borderColor: '#2A2A2A' },
  emptyCard: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: '#76FF00', fontSize: 15, fontWeight: '600' },
  exCard: { backgroundColor: '#161616', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: '#2A2A2A', flexDirection: 'row', alignItems: 'center' },
  exLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  exNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#76FF00', alignItems: 'center', justifyContent: 'center' },
  exNumText: { color: '#000', fontSize: 12, fontWeight: '700' },
  exName: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 3 },
  exDetail: { color: '#888', fontSize: 12 },
  exNotes: { color: '#4ECDC4', fontSize: 11, marginTop: 3, fontStyle: 'italic' },
  exActions: { flexDirection: 'row', gap: 2 },
  aBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#76FF0044', marginTop: 8 },
  addMoreText: { color: '#76FF00', fontSize: 14, fontWeight: '600' },
});
