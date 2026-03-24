import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Card } from '../../src/components/Card';
import { getStats, getPersonalBests, getSessions } from '../../src/utils/api';

export default function ProgressScreen() {
  const { token } = useAuthStore();
  
  const [stats, setStats] = useState<any>(null);
  const [personalBests, setPersonalBests] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!token) return;
    
    try {
      const [statsData, pbData, sessionsData] = await Promise.all([
        getStats(token),
        getPersonalBests(token),
        getSessions(token, 10),
      ]);
      setStats(statsData);
      setPersonalBests(pbData);
      setRecentSessions(sessionsData);
    } catch (error) {
      console.error('Failed to load progress data:', error);
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B35"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.overviewCards}>
          <Card style={styles.overviewCard}>
            <Ionicons name="fitness-outline" size={32} color="#FF6B35" />
            <Text style={styles.overviewValue}>{stats?.total_workouts || 0}</Text>
            <Text style={styles.overviewLabel}>Total Workouts</Text>
          </Card>
          <Card style={styles.overviewCard}>
            <Ionicons name="time-outline" size={32} color="#4ECDC4" />
            <Text style={styles.overviewValue}>{stats?.total_minutes || 0}</Text>
            <Text style={styles.overviewLabel}>Total Minutes</Text>
          </Card>
        </View>

        <View style={styles.overviewCards}>
          <Card style={styles.overviewCard}>
            <Ionicons name="flame-outline" size={32} color="#FFE66D" />
            <Text style={styles.overviewValue}>{stats?.current_streak || 0}</Text>
            <Text style={styles.overviewLabel}>Day Streak</Text>
          </Card>
          <Card style={styles.overviewCard}>
            <Ionicons name="trophy-outline" size={32} color="#A78BFA" />
            <Text style={styles.overviewValue}>{stats?.total_pbs || 0}</Text>
            <Text style={styles.overviewLabel}>Personal Bests</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Bests</Text>
          {personalBests.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="trophy-outline" size={40} color="#333" />
              <Text style={styles.emptyText}>No personal bests yet</Text>
              <Text style={styles.emptySubtext}>Complete workouts to track your PRs</Text>
            </Card>
          ) : (
            <View style={styles.pbList}>
              {personalBests.slice(0, 5).map((pb, index) => (
                <Card key={index} style={styles.pbCard}>
                  <View style={styles.pbIcon}>
                    <Ionicons name="trophy" size={20} color="#FFE66D" />
                  </View>
                  <View style={styles.pbInfo}>
                    <Text style={styles.pbExercise}>{pb.exercise_name}</Text>
                    <Text style={styles.pbDetails}>
                      {pb.weight}kg × {pb.reps} reps
                    </Text>
                  </View>
                  <Text style={styles.pbDate}>{formatDate(pb.date)}</Text>
                </Card>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentSessions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={40} color="#333" />
              <Text style={styles.emptyText}>No workouts completed</Text>
              <Text style={styles.emptySubtext}>Start a workout to see your history</Text>
            </Card>
          ) : (
            <View style={styles.sessionsList}>
              {recentSessions.map((session, index) => (
                <Card key={index} style={styles.sessionCard}>
                  <View style={styles.sessionLeft}>
                    <View style={[
                      styles.sessionStatus,
                      session.status === 'completed' ? styles.statusComplete : styles.statusAbandoned,
                    ]} />
                    <View>
                      <Text style={styles.sessionName}>{session.workout_name}</Text>
                      <Text style={styles.sessionDate}>{formatDate(session.started_at)}</Text>
                    </View>
                  </View>
                  <View style={styles.sessionRight}>
                    {session.total_duration && (
                      <Text style={styles.sessionDuration}>
                        {formatDuration(session.total_duration)}
                      </Text>
                    )}
                    <Ionicons
                      name={session.status === 'completed' ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={session.status === 'completed' ? '#4ECDC4' : '#FF6B6B'}
                    />
                  </View>
                </Card>
              ))}
            </View>
          )}
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  overviewCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  overviewCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  overviewValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
  },
  overviewLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  pbList: {
    gap: 8,
  },
  pbCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  pbIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 230, 109, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pbInfo: {
    flex: 1,
  },
  pbExercise: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pbDetails: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  pbDate: {
    color: '#666',
    fontSize: 12,
  },
  sessionsList: {
    gap: 8,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusComplete: {
    backgroundColor: '#4ECDC4',
  },
  statusAbandoned: {
    backgroundColor: '#FF6B6B',
  },
  sessionName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  sessionDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionDuration: {
    color: '#888',
    fontSize: 12,
  },
});
