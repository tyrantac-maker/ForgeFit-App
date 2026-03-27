import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export interface WorkoutExercise {
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: number;
  rest_seconds: number;
  notes?: string;
  completed: boolean;
  actual_sets?: any[];
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  day_of_week?: string;
  workout_type: string;
  exercises: WorkoutExercise[];
  estimated_duration: number;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id: string;
  workout_name: string;
  started_at: string;
  ended_at?: string;
  total_duration?: number;
  exercises_completed: any[];
  rep_failures: any[];
  adjustments: any[];
  notes?: string;
  status: string;
}

export interface LibraryExercise {
  id: string;
  name: string;
  muscle_group: string;
  secondary_muscles: string[];
  categories: string[];
  equipment_required: string[];
  difficulty: string;
  instructions: string;
  ai_suggested?: boolean;
}

interface WorkoutState {
  workouts: Workout[];
  currentSession: WorkoutSession | null;
  exercises: LibraryExercise[];
  equipmentCatalog: any[];
  isLoading: boolean;
  fetchWorkouts: (token: string) => Promise<void>;
  createWorkout: (token: string, workout: any) => Promise<Workout>;
  updateWorkout: (token: string, workoutId: string, workout: any) => Promise<Workout>;
  deleteWorkout: (token: string, workoutId: string) => Promise<void>;
  generateAIWorkout: (token: string, params: any) => Promise<Workout>;
  startSession: (token: string, workoutId: string) => Promise<WorkoutSession>;
  updateSession: (token: string, sessionId: string, data: any) => Promise<void>;
  completeSession: (token: string, sessionId: string, notes?: string) => Promise<void>;
  logRepFailure: (token: string, sessionId: string, failure: any) => Promise<void>;
  logAdjustment: (token: string, sessionId: string, adjustment: any) => Promise<void>;
  fetchExercises: (token: string) => Promise<void>;
  fetchLibraryExercises: (token: string, params?: { muscle_group?: string; category?: string; equipment_only?: boolean }) => Promise<LibraryExercise[]>;
  analyzeEquipment: (token: string, data: { equipment_name: string; equipment_url?: string; equipment_description?: string }) => Promise<{ analysis: string; exercises: LibraryExercise[]; ai_powered: boolean }>;
  fetchEquipmentCatalog: (token: string) => Promise<void>;
  setCurrentSession: (session: WorkoutSession | null) => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  currentSession: null,
  exercises: [],
  equipmentCatalog: [],
  isLoading: false,

  fetchWorkouts: async (token: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/api/workouts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      set({ workouts: data, isLoading: false });
    } catch (error) {
      console.error('Fetch workouts error:', error);
      set({ isLoading: false });
    }
  },

  createWorkout: async (token: string, workout: any) => {
    const response = await fetch(`${API_URL}/api/workouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(workout),
    });

    if (!response.ok) throw new Error('Failed to create workout');

    const data = await response.json();
    set({ workouts: [...get().workouts, data] });
    return data;
  },

  updateWorkout: async (token: string, workoutId: string, workout: any) => {
    const response = await fetch(`${API_URL}/api/workouts/${workoutId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(workout),
    });

    if (!response.ok) throw new Error('Failed to update workout');

    const data = await response.json();
    set({ workouts: get().workouts.map((w) => (w.id === workoutId ? data : w)) });
    return data;
  },

  deleteWorkout: async (token: string, workoutId: string) => {
    const response = await fetch(`${API_URL}/api/workouts/${workoutId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to delete workout');

    set({ workouts: get().workouts.filter((w) => w.id !== workoutId) });
  },

  generateAIWorkout: async (token: string, params: any) => {
    const response = await fetch(`${API_URL}/api/workouts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate workout');
    }

    const data = await response.json();
    set({ workouts: [...get().workouts, data] });
    return data;
  },

  startSession: async (token: string, workoutId: string) => {
    const response = await fetch(`${API_URL}/api/sessions/start/${workoutId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to start session');

    const data = await response.json();
    set({ currentSession: data });
    return data;
  },

  updateSession: async (token: string, sessionId: string, data: any) => {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update session');

    const updated = await response.json();
    set({ currentSession: updated });
  },

  completeSession: async (token: string, sessionId: string, notes?: string) => {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) throw new Error('Failed to complete session');

    set({ currentSession: null });
  },

  logRepFailure: async (token: string, sessionId: string, failure: any) => {
    await fetch(`${API_URL}/api/sessions/${sessionId}/rep-failure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(failure),
    });
  },

  logAdjustment: async (token: string, sessionId: string, adjustment: any) => {
    await fetch(`${API_URL}/api/sessions/${sessionId}/adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(adjustment),
    });
  },

  fetchExercises: async (token: string) => {
    const response = await fetch(`${API_URL}/api/exercises/available`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    set({ exercises: data });
  },

  fetchLibraryExercises: async (token: string, params = {}) => {
    const qs = new URLSearchParams();
    if (params.muscle_group) qs.append('muscle_group', params.muscle_group);
    if (params.category) qs.append('category', params.category);
    if (params.equipment_only) qs.append('equipment_only', 'true');
    const response = await fetch(`${API_URL}/api/exercises?${qs.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) return [];
    return response.json();
  },

  analyzeEquipment: async (token: string, data) => {
    const response = await fetch(`${API_URL}/api/exercises/analyze-equipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Equipment analysis failed');
    return response.json();
  },

  fetchEquipmentCatalog: async (token: string) => {
    const response = await fetch(`${API_URL}/api/equipment/catalog`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    set({ equipmentCatalog: data });
  },

  setCurrentSession: (session) => set({ currentSession: session }),
}));
