import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useWorkoutStore } from '../../src/store/workoutStore';
import ExerciseLibrary, { SelectedExercise } from '../../src/components/ExerciseLibrary';

type Step = 1 | 2 | 3;

const WORKOUT_TYPES = [
  { id: 'push', label: 'Push', icon: 'arrow-up-outline' },
  { id: 'pull', label: 'Pull', icon: 'arrow-down-outline' },
  { id: 'legs', label: 'Legs', icon: 'footsteps-outline' },
  { id: 'upper', label: 'Upper Body', icon: 'body-outline' },
  { id: 'lower', label: 'Lower Body', icon: 'chevron-down-outline' },
  { id: 'full_body', label: 'Full Body', icon: 'fitness-outline' },
  { id: 'custom', label: 'Custom', icon: 'create-outline' },
];

interface EditExerciseModalProps {
  exercise: SelectedExercise | null;
  visible: boolean;
  onClose: () => void;
  onSave: (updated: SelectedExercise) => void;
  weightUnit: string;
}

function EditExerciseModal({ exercise, visible, onClose, onSave, weightUnit }: EditExerciseModalProps) {
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [rest, setRest] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
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
        <View style={editModalStyles.overlay}>
          <View style={editModalStyles.sheet}>
            <View style={editModalStyles.handle} />
            <View style={editModalStyles.header}>
              <Text style={editModalStyles.title}>{exercise.exercise_name}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={editModalStyles.row}>
              <View style={editModalStyles.half}>
                <Text style={editModalStyles.label}>Sets</Text>
                <View style={editModalStyles.stepper}>
                  <TouchableOpacity onPress={() => setSets(s => String(Math.max(1, parseInt(s||'1') - 1)))} style={editModalStyles.stepBtn}>
                    <Ionicons name="remove" size={18} color="#76FF00" />
                  </TouchableOpacity>
                  <TextInput style={editModalStyles.stepVal} value={sets} onChangeText={setSets} keyboardType="number-pad" />
                  <TouchableOpacity onPress={() => setSets(s => String((parseInt(s||'0')||0) + 1))} style={editModalStyles.stepBtn}>
                    <Ionicons name="add" size={18} color="#76FF00" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={editModalStyles.half}>
                <Text style={editModalStyles.label}>Reps</Text>
                <View style={editModalStyles.stepper}>
                  <TouchableOpacity onPress={() => setReps(r => String(Math.max(1, parseInt(r||'1') - 1)))} style={editModalStyles.stepBtn}>
                    <Ionicons name="remove" size={18} color="#76FF00" />
                  </TouchableOpacity>
                  <TextInput style={editModalStyles.stepVal} value={reps} onChangeText={setReps} keyboardType="number-pad" />
                  <TouchableOpacity onPress={() => setReps(r => String((parseInt(r||'0')||0) + 1))} style={editModalStyles.stepBtn}>
                    <Ionicons name="add" size={18} color="#76FF00" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={editModalStyles.label}>Weight ({weightUnit}) — blank = bodyweight</Text>
            <TextInput style={editModalStyles.input} value={weight} onChangeText={setWeight} placeholder="e.g. 60" placeholderTextColor="#444" keyboardType="decimal-pad" />

            <Text style={editModalStyles.label}>Rest (seconds) — 0 = Superset</Text>
            <View style={editModalStyles.restRow}>
              {['0','30','45','60','90','120','180'].map((r) => (
                <TouchableOpacity key={r} style={[editModalStyles.restChip, rest === r && editModalStyles.restChipOn]} onPress={() => setRest(r)}>
                  <Text style={[editModalStyles.restChipText, rest === r && editModalStyles.restChipTextOn]}>
                    {r === '0' ? 'SS' : r + 's'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={editModalStyles.input} value={rest} onChangeText={setRest} placeholder="Custom seconds" placeholderTextColor="#444" keyboardType="number-pad" />

            <Text style={editModalStyles.label}>Notes (optional)</Text>
            <TextInput style={editModalStyles.input} value={notes} onChangeText={setNotes} placeholder="e.g. Wide grip, pause at bottom" placeholderTextColor="#444" />

            <TouchableOpacity style={editModalStyles.saveBtn} onPress={() => {
              onSave({
                ...exercise,
                sets: Math.max(1, parseInt(sets) || 3),
                reps: Math.max(1, parseInt(reps) || 10),
                weight: weight ? parseFloat(weight) : undefined,
                rest_seconds: parseInt(rest) ?? 60,
                notes: notes.trim() || undefined,
              });
              onClose();
            }}>
              <Text style={editModalStyles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const editModalStyles = StyleSheet.create({
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

// ─── Main Create Screen ──────────────────────────────────────────────────────

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { createWorkout } = useWorkoutStore();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [workoutType, setWorkoutType] = useState('custom');
  const [duration, setDuration] = useState('45');
  const [exercises, setExercises] = useState<SelectedExercise[]>([]);
  const [saving, setSaving] = useState(false);

  const [editTarget, setEditTarget] = useState<SelectedExercise | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  const weightUnit = user?.weight_unit === 'lbs' ? 'lbs' : user?.weight_unit === 'stone' ? 'st' : 'kg';
  const addedIds = exercises.map((e) => e.exercise_id);

  const handleAddExercise = (ex: SelectedExercise) => {
    if (exercises.some((e) => e.exercise_id === ex.exercise_id)) {
      setExercises((prev) => [...prev, { ...ex, exercise_id: `${ex.exercise_id}_${Date.now()}` }]);
    } else {
      setExercises((prev) => [...prev, ex]);
    }
  };

  const handleRemove = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...exercises];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setExercises(next);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === exercises.length - 1) return;
    const next = [...exercises];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setExercises(next);
  };

  const handleEditExercise = (idx: number) => {
    setEditTarget({ ...exercises[idx], _idx: idx } as any);
    setShowEdit(true);
  };

  const handleSaveEdit = (updated: SelectedExercise) => {
    const idx = (updated as any)._idx;
    if (typeof idx === 'number') {
      setExercises((prev) => prev.map((e, i) => i === idx ? { ...updated } : e));
    }
  };

  const handleSave = async () => {
    if (!token) return;
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please give your workout a name.');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Add at least one exercise before saving.');
      return;
    }

    setSaving(true);
    try {
      const workoutExercises = exercises.map((ex, idx) => ({
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        rest_seconds: ex.rest_seconds,
        notes: ex.notes,
        order: idx,
        completed: false,
      }));
      const workout = await createWorkout(token, {
        name: name.trim(),
        workout_type: workoutType,
        exercises: workoutExercises,
        estimated_duration: parseInt(duration) || 45,
        ai_generated: false,
      });
      router.replace(`/workout/${workout.id}` as any);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => step > 1 ? setStep((s) => (s - 1) as Step) : router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.steps}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.stepDot, step >= s && styles.stepDotOn]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>Step {step} of 3</Text>
      </View>

      {step === 1 && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Name Your Workout</Text>
          <Text style={styles.pageSub}>Choose a name and type for this workout plan.</Text>

          <Text style={styles.fieldLabel}>Workout Name</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Monday Push Day"
            placeholderTextColor="#444"
            returnKeyType="done"
          />

          <Text style={styles.fieldLabel}>Workout Type</Text>
          <View style={styles.typeGrid}>
            {WORKOUT_TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeCard, workoutType === t.id && styles.typeCardOn]}
                onPress={() => setWorkoutType(t.id)}
              >
                <Ionicons name={t.icon as any} size={22} color={workoutType === t.id ? '#76FF00' : '#666'} />
                <Text style={[styles.typeLabel, workoutType === t.id && styles.typeLabelOn]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Target Duration</Text>
          <View style={styles.durationRow}>
            {['30', '45', '60', '75', '90'].map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.durChip, duration === d && styles.durChipOn]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.durText, duration === d && styles.durTextOn]}>{d}m</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.customDuration}
            value={duration}
            onChangeText={setDuration}
            placeholder="Custom minutes"
            placeholderTextColor="#444"
            keyboardType="number-pad"
          />

          <TouchableOpacity
            style={[styles.nextBtn, !name.trim() && { opacity: 0.4 }]}
            onPress={() => setStep(2)}
            disabled={!name.trim()}
          >
            <Text style={styles.nextBtnText}>Pick Exercises</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 2 && (
        <View style={{ flex: 1 }}>
          <View style={styles.step2Header}>
            <Text style={styles.pageTitle}>Exercise Library</Text>
            <TouchableOpacity
              style={[styles.reviewBtn, exercises.length === 0 && { opacity: 0.4 }]}
              onPress={() => setStep(3)}
              disabled={exercises.length === 0}
            >
              <Text style={styles.reviewBtnText}>Review ({exercises.length})</Text>
              <Ionicons name="arrow-forward" size={16} color="#000" />
            </TouchableOpacity>
          </View>
          <ExerciseLibrary
            token={token!}
            weightUnit={weightUnit}
            onAdd={handleAddExercise}
            addedIds={addedIds}
          />
        </View>
      )}

      {step === 3 && (
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 140 }]} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Review Workout</Text>
          <Text style={styles.pageSub}>{name} • {duration} min • {exercises.length} exercises</Text>

          {exercises.length === 0 ? (
            <TouchableOpacity style={styles.addMoreCard} onPress={() => setStep(2)}>
              <Ionicons name="add-circle-outline" size={40} color="#76FF00" />
              <Text style={styles.addMoreText}>Add exercises from the library</Text>
            </TouchableOpacity>
          ) : (
            exercises.map((ex, idx) => (
              <View key={`${ex.exercise_id}_${idx}`} style={styles.reviewCard}>
                <View style={styles.reviewLeft}>
                  <View style={styles.reviewNum}>
                    <Text style={styles.reviewNumText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{ex.exercise_name}</Text>
                    <Text style={styles.reviewDetail}>
                      {ex.sets} sets × {ex.reps} reps
                      {ex.weight ? ` @ ${ex.weight}${weightUnit}` : ''}
                      {' • '}{ex.rest_seconds === 0 ? 'Superset' : `${ex.rest_seconds}s rest`}
                    </Text>
                    {ex.notes ? <Text style={styles.reviewNotes}>{ex.notes}</Text> : null}
                  </View>
                </View>
                <View style={styles.reviewActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleMoveUp(idx)}>
                    <Ionicons name="chevron-up" size={18} color={idx === 0 ? '#333' : '#888'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleMoveDown(idx)}>
                    <Ionicons name="chevron-down" size={18} color={idx === exercises.length - 1 ? '#333' : '#888'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditExercise(idx)}>
                    <Ionicons name="create-outline" size={18} color="#76FF00" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleRemove(idx)}>
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.addMoreBtn} onPress={() => setStep(2)}>
            <Ionicons name="add" size={18} color="#76FF00" />
            <Text style={styles.addMoreBtnText}>Add More Exercises</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 3 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, (saving || exercises.length === 0) && { opacity: 0.5 }]}
            onPress={handleSave}
            disabled={saving || exercises.length === 0}
          >
            {saving ? (
              <Text style={styles.saveBtnText}>Saving...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#000" />
                <Text style={styles.saveBtnText}>Save Workout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <EditExerciseModal
        exercise={editTarget}
        visible={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={handleSaveEdit}
        weightUnit={weightUnit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  steps: { flexDirection: 'row', gap: 6, flex: 1, justifyContent: 'center' },
  stepDot: { width: 28, height: 4, borderRadius: 2, backgroundColor: '#2A2A2A' },
  stepDotOn: { backgroundColor: '#76FF00' },
  stepLabel: { color: '#666', fontSize: 13, fontWeight: '600' },
  scroll: { padding: 20 },
  pageTitle: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 6 },
  pageSub: { color: '#666', fontSize: 14, marginBottom: 28 },
  fieldLabel: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 10, marginTop: 4 },
  nameInput: { backgroundColor: '#1A1A1A', borderRadius: 14, color: '#fff', paddingHorizontal: 16, paddingVertical: 14, fontSize: 17, borderWidth: 1.5, borderColor: '#2A2A2A', marginBottom: 24 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  typeCard: { width: '47%', padding: 16, borderRadius: 14, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#2A2A2A', alignItems: 'center', gap: 8 },
  typeCardOn: { borderColor: '#76FF00', backgroundColor: 'rgba(118,255,0,0.08)' },
  typeLabel: { color: '#666', fontSize: 13, fontWeight: '600' },
  typeLabelOn: { color: '#76FF00' },
  durationRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  durChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#2A2A2A' },
  durChipOn: { borderColor: '#76FF00', backgroundColor: 'rgba(118,255,0,0.12)' },
  durText: { color: '#666', fontSize: 14, fontWeight: '600' },
  durTextOn: { color: '#76FF00' },
  customDuration: { backgroundColor: '#1A1A1A', borderRadius: 12, color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1.5, borderColor: '#2A2A2A', marginBottom: 32 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#76FF00', borderRadius: 14, paddingVertical: 16, gap: 8 },
  nextBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  step2Header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#76FF00', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  reviewBtnText: { color: '#000', fontSize: 13, fontWeight: '700' },
  reviewCard: { backgroundColor: '#161616', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: '#2A2A2A', flexDirection: 'row', alignItems: 'center' },
  reviewLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  reviewNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#76FF00', alignItems: 'center', justifyContent: 'center' },
  reviewNumText: { color: '#000', fontSize: 13, fontWeight: '700' },
  reviewName: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  reviewDetail: { color: '#888', fontSize: 13 },
  reviewNotes: { color: '#4ECDC4', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  reviewActions: { flexDirection: 'row', gap: 2 },
  actionBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  addMoreCard: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  addMoreText: { color: '#76FF00', fontSize: 15, fontWeight: '600' },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, borderColor: '#76FF0044', marginTop: 12 },
  addMoreBtnText: { color: '#76FF00', fontSize: 15, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: '#0A0A0A', borderTopWidth: 1, borderTopColor: '#1A1A1A' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#76FF00', borderRadius: 14, paddingVertical: 16, gap: 8 },
  saveBtnText: { color: '#000', fontSize: 17, fontWeight: '700' },
});
