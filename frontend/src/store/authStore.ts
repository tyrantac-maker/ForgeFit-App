import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config';

const API_URL = BACKEND_URL;

export interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  age?: number;
  height?: number;
  height_unit?: 'cm' | 'ft_in';
  height_feet?: number;
  height_inches?: number;
  weight?: number;
  weight_unit?: 'kg' | 'lbs' | 'stone';
  country?: string;
  country_code?: string;
  location?: string;
  preferred_language?: string;
  dob?: string;
  fitness_level?: string;
  starting_weight?: number;
  goal_weight?: number;
  goals?: string[];
  training_location?: string;
  gym_name?: string;
  equipment?: any[];
  custom_equipment?: any[];
  schedule?: any;
  workout_preferences?: any;
  workout_days?: string[];
  gym_location?: string;
  role?: string;
  profile_complete?: boolean;
  onboarding_step?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  exchangeSession: (sessionId: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    await AsyncStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
  },

  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    const data = await response.json();
    await AsyncStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    const token = get().token;
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      });
    } catch (e) {
      console.log('Logout error:', e);
    }
    await AsyncStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        set({ isLoading: false, isAuthenticated: false });
        return false;
      }

      const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${storedToken}` },
      });

      if (!refreshResponse.ok) {
        await AsyncStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return false;
      }

      const { token: newToken, user } = await refreshResponse.json();
      await AsyncStorage.setItem('token', newToken);
      set({ user, token: newToken, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      console.log('Auth check error:', error);
      set({ isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  exchangeSession: async (sessionId: string) => {
    const response = await fetch(`${API_URL}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Session exchange failed');
    }

    const data = await response.json();
    await AsyncStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
  },

  updateProfile: async (data: Partial<User>) => {
    const token = get().token;
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let detail = `Error ${response.status}`;
      try {
        const errBody = await response.json();
        detail = errBody.detail || JSON.stringify(errBody);
      } catch {}
      throw new Error(detail);
    }

    const updatedUser = await response.json();
    set({ user: updatedUser });
  },
}));
