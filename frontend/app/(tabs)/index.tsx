import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useWorkoutStore } from '../../src/store/workoutStore';
import { Card, StatCard } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { getStats, getWeeklyStats } from '../../src/utils/api';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { workouts, fetchWorkouts } = useWorkoutStore();
  
  const [stats, setStats] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!token) return;
    
    try {
      const [statsData, weeklyData] = await Promise.all([
        getStats(token),
        getWeeklyStats(token),
      ]);
      setStats(statsData);
      setWeeklyStats(weeklyData);
      await fetchWorkouts(token);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayWorkout = workouts.find((w) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return w.day_of_week === today;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#76FF00"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'Athlete'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Workouts"
            value={stats?.total_workouts || 0}
            icon="fitness-outline"
            color="#76FF00"
          />
          <StatCard
            title="Minutes"
            value={stats?.total_minutes || 0}
            icon="time-outline"
            color="#4ECDC4"
          />
          <StatCard
            title="Streak"
            value={stats?.current_streak || 0}
            icon="flame-outline"
            color="#FFE66D"
            subtitle="days"
          />
        </View>

        <View style={styles.weeklySection}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weeklyChart}>
            {weeklyStats.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <View
                  style={[
                    styles.dayBar,
                    day.workouts > 0 && styles.dayBarActive,
                  ]}
                />
                <Text style={styles.dayLabel}>{day.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {todayWorkout ? (
          <Card style={styles.todayCard} onPress={() => router.push(`/workout/${todayWorkout.id}` as any)}>
            <View style={styles.todayHeader}>
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>TODAY</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </View>
            <Text style={styles.workoutName}>{todayWorkout.name}</Text>
            <View style={styles.workoutMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="barbell-outline" size={16} color="#888" />
                <Text style={styles.metaText}>
                  {todayWorkout.exercises?.length || 0} exercises
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#888" />
                <Text style={styles.metaText}>
                  {todayWorkout.estimated_duration} min
                </Text>
              </View>
            </View>
            <Button
              title="Start Workout"
              onPress={() => router.push(`/workout/${todayWorkout.id}` as any)}
              style={styles.startButton}
              icon={<Ionicons name="play" size={18} color="#fff" />}
            />
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Workout Scheduled</Text>
            <Text style={styles.emptyText}>
              Create or generate a workout for today
            </Text>
            <Button
              title="Generate AI Workout"
              onPress={() => router.push('/(tabs)/workouts')}
              style={styles.generateButton}
              icon={<Ionicons name="sparkles" size={18} color="#fff" />}
            />
          </Card>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/workouts')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(118,255,0,0.12)' }]}>
                <Ionicons name="sparkles" size={24} color="#76FF00" />
              </View>
              <Text style={styles.actionLabel}>AI Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/workouts')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(78, 205, 196, 0.2)' }]}>
                <Ionicons name="create-outline" size={24} color="#4ECDC4" />
              </View>
              <Text style={styles.actionLabel}>Custom</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/progress')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 230, 109, 0.2)' }]}>
                <Ionicons name="trophy-outline" size={24} color="#FFE66D" />
              </View>
              <Text style={styles.actionLabel}>PBs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    color: '#888',
    fontSize: 16,
  },
  userName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#76FF00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  weeklySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayBar: {
    width: 8,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#2A2A2A',
    marginBottom: 8,
  },
  dayBarActive: {
    backgroundColor: '#76FF00',
  },
  dayLabel: {
    color: '#666',
    fontSize: 12,
  },
  todayCard: {
    marginBottom: 24,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayBadge: {
    backgroundColor: 'rgba(118,255,0,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    color: '#76FF00',
    fontSize: 12,
    fontWeight: '700',
  },
  workoutName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#888',
    fontSize: 14,
  },
  startButton: {
    marginTop: 8,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  generateButton: {
    paddingHorizontal: 24,
  },
  quickActions: {
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
