import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';

function formatHeight(user: any): string {
  if (!user?.height) return '-';
  if (user.height_unit === 'ft_in') {
    const feet = user.height_feet ?? Math.floor(user.height / 30.48);
    const inches = user.height_inches ?? Math.round((user.height % 30.48) / 2.54);
    return `${feet}ft ${inches}in`;
  }
  return `${user.height} cm`;
}

function formatWeight(kg: number | undefined, unit: string | undefined, label: string): string {
  if (!kg) return '-';
  if (unit === 'lbs') {
    return `${Math.round(kg * 2.20462 * 10) / 10} lbs`;
  }
  if (unit === 'stone') {
    return `${Math.round((kg / 6.35029) * 10) / 10} st`;
  }
  return `${kg} kg`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const ProfileItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={styles.profileItem}>
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon as any} size={20} color="#888" />
        <Text style={styles.profileLabel}>{label}</Text>
      </View>
      <Text style={styles.profileValue}>{value || '-'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Personal Info</Text>
          <ProfileItem icon="calendar-outline" label="Age" value={user?.age ? `${user.age} years` : '-'} />
          <ProfileItem icon="resize-outline" label="Height" value={formatHeight(user)} />
          <ProfileItem icon="scale-outline" label="Weight" value={formatWeight(user?.weight, user?.weight_unit, 'weight')} />
          <ProfileItem icon="location-outline" label="Location" value={user?.location || user?.country || '-'} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Fitness Profile</Text>
          <ProfileItem icon="trending-up-outline" label="Level" value={user?.fitness_level || '-'} />
          <ProfileItem icon="flag-outline" label="Goals" value={user?.goals?.join(', ') || '-'} />
          <ProfileItem icon="home-outline" label="Training" value={user?.training_location || '-'} />
          {user?.gym_name && (
            <ProfileItem icon="business-outline" label="Gym" value={user.gym_name} />
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Equipment</Text>
          {user?.equipment && user.equipment.length > 0 ? (
            <View style={styles.equipmentList}>
              {user.equipment.map((item: any, index: number) => (
                <View key={index} style={styles.equipmentChip}>
                  <Ionicons name="checkmark" size={14} color="#76FF00" />
                  <Text style={styles.equipmentText}>{item.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noEquipment}>No equipment selected</Text>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Schedule</Text>
          <ProfileItem 
            icon="calendar-outline" 
            label="Training Days" 
            value={user?.schedule?.days?.join(', ') || '-'} 
          />
          <ProfileItem 
            icon="time-outline" 
            label="Session Duration" 
            value={user?.schedule?.duration ? `${user.schedule.duration} min` : '-'} 
          />
        </Card>

        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/onboarding/profile')}>
          <Ionicons name="create-outline" size={20} color="#76FF00" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
          icon={<Ionicons name="log-out-outline" size={20} color="#fff" />}
        />
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#76FF00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  userEmail: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    color: '#76FF00',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileLabel: {
    color: '#888',
    fontSize: 14,
  },
  profileValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(118,255,0,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  equipmentText: {
    color: '#76FF00',
    fontSize: 12,
    fontWeight: '500',
  },
  noEquipment: {
    color: '#666',
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  editButtonText: {
    color: '#76FF00',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 16,
  },
});
