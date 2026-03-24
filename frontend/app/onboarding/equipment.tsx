import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useWorkoutStore } from '../../src/store/workoutStore';
import { Button } from '../../src/components/Button';
import { saveEquipment } from '../../src/utils/api';

interface EquipmentItem {
  name: string;
  category: string;
  has_weight: boolean;
  selected: boolean;
  min_weight?: number;
  max_weight?: number;
  default_resistance?: string;
}

export default function EquipmentOnboarding() {
  const router = useRouter();
  const { user, token, updateProfile } = useAuthStore();
  const { fetchEquipmentCatalog, equipmentCatalog } = useWorkoutStore();
  
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (token) {
      fetchEquipmentCatalog(token);
    }
  }, [token]);

  useEffect(() => {
    if (equipmentCatalog.length > 0) {
      const existingEquipment = user?.equipment || [];
      const existingNames = existingEquipment.map((e: any) => e.name);
      
      setEquipment(
        equipmentCatalog.map((item: any) => ({
          ...item,
          selected: existingNames.includes(item.name),
          min_weight: existingEquipment.find((e: any) => e.name === item.name)?.min_weight || 0,
          max_weight: existingEquipment.find((e: any) => e.name === item.name)?.max_weight || 0,
        }))
      );
    }
  }, [equipmentCatalog, user]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'free_weights', label: 'Free Weights' },
    { id: 'machines', label: 'Machines' },
    { id: 'bands', label: 'Bands' },
    { id: 'bodyweight', label: 'Bodyweight' },
    { id: 'cardio', label: 'Cardio' },
  ];

  const toggleEquipment = (index: number) => {
    const updated = [...equipment];
    updated[index].selected = !updated[index].selected;
    setEquipment(updated);
  };

  const updateWeight = (index: number, field: 'min_weight' | 'max_weight', value: string) => {
    const updated = [...equipment];
    updated[index][field] = value ? parseFloat(value) : 0;
    setEquipment(updated);
  };

  const handleContinue = async () => {
    const selectedEquipment = equipment
      .filter((item) => item.selected)
      .map((item) => ({
        name: item.name,
        category: item.category,
        min_weight: item.min_weight || 0,
        max_weight: item.max_weight || 0,
        available: true,
      }));

    setLoading(true);
    try {
      if (token) {
        await saveEquipment(token, selectedEquipment);
      }
      await updateProfile({
        equipment: selectedEquipment,
        onboarding_step: 4,
      });
      router.push('/onboarding/schedule');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const filteredEquipment = activeCategory === 'all'
    ? equipment
    : equipment.filter((item) => item.category === activeCategory);

  const selectedCount = equipment.filter((item) => item.selected).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '80%' }]} />
        </View>

        <View style={styles.header}>
          <Text style={styles.step}>Step 4 of 5</Text>
          <Text style={styles.title}>Your Equipment</Text>
          <Text style={styles.subtitle}>Select what you have access to</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                activeCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === cat.id && styles.categoryTextActive,
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredEquipment.map((item, index) => {
          const originalIndex = equipment.findIndex((e) => e.name === item.name);
          return (
            <View key={item.name} style={styles.equipmentCard}>
              <TouchableOpacity
                style={styles.equipmentHeader}
                onPress={() => toggleEquipment(originalIndex)}
              >
                <View style={[
                  styles.checkbox,
                  item.selected && styles.checkboxSelected,
                ]}>
                  {item.selected && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.equipmentInfo}>
                  <Text style={[
                    styles.equipmentName,
                    item.selected && styles.equipmentNameSelected,
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={styles.equipmentCategory}>{item.category}</Text>
                </View>
              </TouchableOpacity>

              {item.selected && item.has_weight && (
                <View style={styles.weightInputs}>
                  <View style={styles.weightField}>
                    <Text style={styles.weightLabel}>Min Weight (kg)</Text>
                    <TextInput
                      style={styles.weightInput}
                      value={item.min_weight?.toString() || ''}
                      onChangeText={(v) => updateWeight(originalIndex, 'min_weight', v)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666"
                    />
                  </View>
                  <View style={styles.weightField}>
                    <Text style={styles.weightLabel}>Max Weight (kg)</Text>
                    <TextInput
                      style={styles.weightInput}
                      value={item.max_weight?.toString() || ''}
                      onChangeText={(v) => updateWeight(originalIndex, 'max_weight', v)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666"
                    />
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>{selectedCount} items selected</Text>
        <Button
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  headerSection: {
    padding: 24,
    paddingBottom: 0,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  header: {
    marginBottom: 20,
  },
  step: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContent: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  categoryChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
    gap: 12,
  },
  equipmentCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  equipmentNameSelected: {
    color: '#FF6B35',
  },
  equipmentCategory: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  weightInputs: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  weightField: {
    flex: 1,
  },
  weightLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 6,
  },
  weightInput: {
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  selectedCount: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
});
