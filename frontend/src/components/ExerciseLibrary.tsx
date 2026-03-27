import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore, LibraryExercise } from '../store/workoutStore';

export interface SelectedExercise {
  exercise_id: string;
  exercise_name: string;
  muscle_group: string;
  sets: number;
  reps: number;
  weight?: number;
  rest_seconds: number;
  notes?: string;
}

interface ExerciseConfigModalProps {
  exercise: LibraryExercise | null;
  visible: boolean;
  onClose: () => void;
  onAdd: (configured: SelectedExercise) => void;
  weightUnit: string;
}

function ExerciseConfigModal({ exercise, visible, onClose, onAdd, weightUnit }: ExerciseConfigModalProps) {
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('');
  const [rest, setRest] = useState('60');

  useEffect(() => {
    if (exercise) {
      setSets('3');
      setReps('10');
      setWeight('');
      setRest('60');
    }
  }, [exercise]);

  if (!exercise) return null;

  const restLabel = rest === '0' ? 'Superset (0s)' : `${rest}s rest`;

  const handleAdd = () => {
    onAdd({
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      muscle_group: exercise.muscle_group,
      sets: Math.max(1, parseInt(sets) || 3),
      reps: Math.max(1, parseInt(reps) || 10),
      weight: weight ? parseFloat(weight) : undefined,
      rest_seconds: parseInt(rest) || 60,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={cfgStyles.overlay}>
          <View style={cfgStyles.sheet}>
            <View style={cfgStyles.handle} />
            <View style={cfgStyles.header}>
              <Text style={cfgStyles.title}>{exercise.name}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <Text style={cfgStyles.instructions}>{exercise.instructions}</Text>

            <View style={cfgStyles.grid}>
              <View style={cfgStyles.cell}>
                <Text style={cfgStyles.label}>Sets</Text>
                <View style={cfgStyles.stepper}>
                  <TouchableOpacity style={cfgStyles.stepBtn} onPress={() => setSets(s => String(Math.max(1, parseInt(s||'1') - 1)))}>
                    <Ionicons name="remove" size={18} color="#76FF00" />
                  </TouchableOpacity>
                  <TextInput style={cfgStyles.stepValue} value={sets} onChangeText={setSets} keyboardType="number-pad" />
                  <TouchableOpacity style={cfgStyles.stepBtn} onPress={() => setSets(s => String((parseInt(s||'0') || 0) + 1))}>
                    <Ionicons name="add" size={18} color="#76FF00" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={cfgStyles.cell}>
                <Text style={cfgStyles.label}>Reps</Text>
                <View style={cfgStyles.stepper}>
                  <TouchableOpacity style={cfgStyles.stepBtn} onPress={() => setReps(r => String(Math.max(1, parseInt(r||'1') - 1)))}>
                    <Ionicons name="remove" size={18} color="#76FF00" />
                  </TouchableOpacity>
                  <TextInput style={cfgStyles.stepValue} value={reps} onChangeText={setReps} keyboardType="number-pad" />
                  <TouchableOpacity style={cfgStyles.stepBtn} onPress={() => setReps(r => String((parseInt(r||'0') || 0) + 1))}>
                    <Ionicons name="add" size={18} color="#76FF00" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={cfgStyles.cell}>
              <Text style={cfgStyles.label}>Weight ({weightUnit}) — leave blank for bodyweight</Text>
              <TextInput
                style={cfgStyles.weightInput}
                value={weight}
                onChangeText={setWeight}
                placeholder="e.g. 60"
                placeholderTextColor="#444"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={cfgStyles.cell}>
              <Text style={cfgStyles.label}>Rest between sets — {restLabel}</Text>
              <View style={cfgStyles.restRow}>
                {['0','30','45','60','90','120','180'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[cfgStyles.restChip, rest === r && cfgStyles.restChipOn]}
                    onPress={() => setRest(r)}
                  >
                    <Text style={[cfgStyles.restChipText, rest === r && cfgStyles.restChipTextOn]}>
                      {r === '0' ? 'SS' : r + 's'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={cfgStyles.weightInput}
                value={rest}
                onChangeText={setRest}
                placeholder="Custom seconds"
                placeholderTextColor="#444"
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity style={cfgStyles.addBtn} onPress={handleAdd}>
              <Ionicons name="add-circle" size={22} color="#000" />
              <Text style={cfgStyles.addBtnText}>Add to Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const cfgStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#161616', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#333', alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', flex: 1, marginRight: 12 },
  instructions: { color: '#888', fontSize: 13, marginBottom: 20, lineHeight: 18 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  cell: { flex: 1, marginBottom: 16 },
  label: { color: '#888', fontSize: 12, marginBottom: 8, fontWeight: '500' },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', borderRadius: 12, overflow: 'hidden' },
  stepBtn: { padding: 12 },
  stepValue: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  weightInput: { backgroundColor: '#222', borderRadius: 12, color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  restRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  restChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#2A2A2A', borderWidth: 1.5, borderColor: '#2A2A2A' },
  restChipOn: { borderColor: '#76FF00', backgroundColor: 'rgba(118,255,0,0.12)' },
  restChipText: { color: '#666', fontSize: 12, fontWeight: '600' },
  restChipTextOn: { color: '#76FF00' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#76FF00', borderRadius: 14, paddingVertical: 16, gap: 8, marginTop: 8 },
  addBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});

// ─── AI Equipment Analyser Modal ─────────────────────────────────────────────

interface AIEquipmentModalProps {
  visible: boolean;
  onClose: () => void;
  onResults: (exercises: LibraryExercise[], analysis: string) => void;
  token: string;
}

function AIEquipmentModal({ visible, onClose, onResults, token }: AIEquipmentModalProps) {
  const { analyzeEquipment } = useWorkoutStore();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeEquipment(token, { equipment_name: name, equipment_url: url || undefined, equipment_description: desc || undefined });
      onResults(result.exercises, result.analysis);
      onClose();
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={aiStyles.overlay}>
          <View style={aiStyles.sheet}>
            <View style={aiStyles.header}>
              <View>
                <Text style={aiStyles.title}>AI Equipment Analysis</Text>
                <Text style={aiStyles.sub}>Paste a URL or describe your equipment — AI finds compatible exercises</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <Text style={aiStyles.label}>Equipment Name *</Text>
            <TextInput style={aiStyles.input} value={name} onChangeText={setName} placeholder="e.g. Lat Pulldown Machine" placeholderTextColor="#444" />

            <Text style={aiStyles.label}>Equipment URL (optional)</Text>
            <TextInput style={aiStyles.input} value={url} onChangeText={setUrl} placeholder="https://..." placeholderTextColor="#444" autoCapitalize="none" />

            <Text style={aiStyles.label}>Description (optional)</Text>
            <TextInput style={[aiStyles.input, { height: 72, textAlignVertical: 'top' }]} value={desc} onChangeText={setDesc} placeholder="Describe what it does, cable attachments, weight range..." placeholderTextColor="#444" multiline />

            <TouchableOpacity style={[aiStyles.btn, !name.trim() && { opacity: 0.4 }]} onPress={handleAnalyze} disabled={!name.trim() || loading}>
              {loading ? <ActivityIndicator color="#000" /> : <><Ionicons name="sparkles" size={20} color="#000" /><Text style={aiStyles.btnText}>Analyse Equipment</Text></>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const aiStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#161616', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  sub: { color: '#666', fontSize: 13, marginTop: 4, maxWidth: 260 },
  label: { color: '#888', fontSize: 12, marginBottom: 6, marginTop: 12, fontWeight: '500' },
  input: { backgroundColor: '#222', borderRadius: 12, color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#76FF00', borderRadius: 14, paddingVertical: 16, gap: 8, marginTop: 20 },
  btnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});

// ─── Main ExerciseLibrary Component ─────────────────────────────────────────

const MUSCLE_TABS = ['all', 'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes', 'full_body'] as const;
const CATEGORY_FILTERS = ['all', 'push', 'pull', 'compound', 'bodyweight', 'isolation'] as const;

interface ExerciseLibraryProps {
  token: string;
  weightUnit: string;
  onAdd: (exercise: SelectedExercise) => void;
  addedIds: string[];
}

export default function ExerciseLibrary({ token, weightUnit, onAdd, addedIds }: ExerciseLibraryProps) {
  const { fetchLibraryExercises } = useWorkoutStore();

  const [allExercises, setAllExercises] = useState<LibraryExercise[]>([]);
  const [aiExercises, setAiExercises] = useState<LibraryExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [myEquipmentOnly, setMyEquipmentOnly] = useState(true);

  const [configExercise, setConfigExercise] = useState<LibraryExercise | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');

  const loadExercises = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLibraryExercises(token, {
        muscle_group: muscle !== 'all' ? muscle : undefined,
        category: category !== 'all' ? category : undefined,
        equipment_only: myEquipmentOnly,
      });
      setAllExercises(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, muscle, category, myEquipmentOnly]);

  useEffect(() => { loadExercises(); }, [loadExercises]);

  const filtered = [...allExercises, ...aiExercises].filter((ex) => {
    if (!search) return true;
    return ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscle_group.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = (ex: LibraryExercise) => {
    setConfigExercise(ex);
    setShowConfig(true);
  };

  const categoryColor = (cat: string) => {
    const map: Record<string, string> = { push: '#FF6B35', pull: '#4ECDC4', compound: '#76FF00', bodyweight: '#A29BFE', isolation: '#FD79A8' };
    return map[cat] || '#888';
  };

  const difficultyColor = (d: string) => {
    if (d === 'beginner') return '#76FF00';
    if (d === 'intermediate') return '#FFB347';
    return '#FF6B6B';
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#666" style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.search}
            placeholder="Search exercises..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 12 }}>
              <Ionicons name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.equipToggle, myEquipmentOnly && styles.equipToggleOn]}
            onPress={() => setMyEquipmentOnly((v) => !v)}
          >
            <Ionicons name={myEquipmentOnly ? 'lock-closed' : 'globe-outline'} size={14} color={myEquipmentOnly ? '#76FF00' : '#666'} />
            <Text style={[styles.equipToggleText, myEquipmentOnly && styles.equipToggleTextOn]}>
              {myEquipmentOnly ? 'My Equipment' : 'All Equipment'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.aiBtn} onPress={() => setShowAI(true)}>
            <Ionicons name="sparkles" size={14} color="#76FF00" />
            <Text style={styles.aiBtnText}>AI Scan</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleTabs} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 8 }}>
        {MUSCLE_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, muscle === tab && styles.tabOn]}
            onPress={() => setMuscle(tab)}
          >
            <Text style={[styles.tabText, muscle === tab && styles.tabTextOn]}>
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}>
        {CATEGORY_FILTERS.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, category === cat && { borderColor: categoryColor(cat), backgroundColor: `${categoryColor(cat)}18` }]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catChipText, category === cat && { color: categoryColor(cat) }]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {aiAnalysis ? (
        <View style={styles.aiAnalysisBanner}>
          <Ionicons name="sparkles" size={14} color="#76FF00" />
          <Text style={styles.aiAnalysisText} numberOfLines={2}>{aiAnalysis}</Text>
          <TouchableOpacity onPress={() => { setAiAnalysis(''); setAiExercises([]); }}>
            <Ionicons name="close" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#76FF00" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, gap: 10 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color="#333" />
              <Text style={styles.emptyText}>No exercises found</Text>
              <Text style={styles.emptySubText}>Try switching to 'All Equipment' or a different filter</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isAdded = addedIds.includes(item.id);
            return (
              <TouchableOpacity style={[styles.card, isAdded && styles.cardAdded]} onPress={() => handleSelect(item)} activeOpacity={0.75}>
                <View style={styles.cardLeft}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    {isAdded && <Ionicons name="checkmark-circle" size={18} color="#76FF00" />}
                  </View>
                  <Text style={styles.cardMuscle}>{item.muscle_group.replace('_', ' ')}</Text>
                  <View style={styles.cardTags}>
                    {item.categories.slice(0, 2).map((cat) => (
                      <View key={cat} style={[styles.tag, { backgroundColor: `${categoryColor(cat)}22`, borderColor: `${categoryColor(cat)}66` }]}>
                        <Text style={[styles.tagText, { color: categoryColor(cat) }]}>{cat}</Text>
                      </View>
                    ))}
                    <View style={[styles.tag, { backgroundColor: `${difficultyColor(item.difficulty)}18`, borderColor: `${difficultyColor(item.difficulty)}44` }]}>
                      <Text style={[styles.tagText, { color: difficultyColor(item.difficulty) }]}>{item.difficulty}</Text>
                    </View>
                    {item.ai_suggested && (
                      <View style={[styles.tag, { backgroundColor: 'rgba(118,255,0,0.12)', borderColor: '#76FF0044' }]}>
                        <Text style={[styles.tagText, { color: '#76FF00' }]}>AI</Text>
                      </View>
                    )}
                  </View>
                  {item.equipment_required.length > 0 && (
                    <Text style={styles.equipment} numberOfLines={1}>
                      <Ionicons name="barbell-outline" size={11} color="#555" /> {item.equipment_required.join(', ')}
                    </Text>
                  )}
                </View>
                <TouchableOpacity style={[styles.addIcon, isAdded && styles.addIconAdded]} onPress={() => handleSelect(item)}>
                  <Ionicons name={isAdded ? 'add' : 'add'} size={20} color={isAdded ? '#76FF00' : '#888'} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <ExerciseConfigModal
        exercise={configExercise}
        visible={showConfig}
        onClose={() => setShowConfig(false)}
        onAdd={onAdd}
        weightUnit={weightUnit}
      />
      <AIEquipmentModal
        visible={showAI}
        onClose={() => setShowAI(false)}
        token={token}
        onResults={(exs, analysis) => {
          setAiExercises(exs);
          setAiAnalysis(analysis);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A' },
  search: { flex: 1, color: '#fff', paddingHorizontal: 10, paddingVertical: 12, fontSize: 15 },
  filterRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  equipToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#2A2A2A' },
  equipToggleOn: { borderColor: '#76FF0066', backgroundColor: 'rgba(118,255,0,0.08)' },
  equipToggleText: { color: '#666', fontSize: 12, fontWeight: '600' },
  equipToggleTextOn: { color: '#76FF00' },
  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(118,255,0,0.1)', borderWidth: 1.5, borderColor: '#76FF0044' },
  aiBtnText: { color: '#76FF00', fontSize: 12, fontWeight: '600' },
  muscleTabs: { maxHeight: 48 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#2A2A2A' },
  tabOn: { backgroundColor: '#76FF00', borderColor: '#76FF00' },
  tabText: { color: '#666', fontSize: 13, fontWeight: '600' },
  tabTextOn: { color: '#000' },
  categoryRow: { maxHeight: 40 },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#2A2A2A' },
  catChipText: { color: '#666', fontSize: 12, fontWeight: '600' },
  aiAnalysisBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16, padding: 12, backgroundColor: 'rgba(118,255,0,0.08)', borderRadius: 12, borderWidth: 1, borderColor: '#76FF0033' },
  aiAnalysisText: { flex: 1, color: '#aaa', fontSize: 12 },
  loading: { alignItems: 'center', paddingTop: 40, gap: 12 },
  loadingText: { color: '#666', fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyText: { color: '#666', fontSize: 16, fontWeight: '600' },
  emptySubText: { color: '#444', fontSize: 13, textAlign: 'center' },
  card: { backgroundColor: '#161616', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#2A2A2A' },
  cardAdded: { borderColor: '#76FF0044', backgroundColor: 'rgba(118,255,0,0.04)' },
  cardLeft: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  cardName: { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 },
  cardMuscle: { color: '#666', fontSize: 12, textTransform: 'capitalize', marginBottom: 8 },
  cardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  tagText: { fontSize: 10, fontWeight: '700' },
  equipment: { color: '#444', fontSize: 11, marginTop: 2 },
  addIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  addIconAdded: { backgroundColor: 'rgba(118,255,0,0.15)' },
});
