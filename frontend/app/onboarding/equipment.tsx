import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useWorkoutStore } from '../../src/store/workoutStore';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { saveEquipment } from '../../src/utils/api';
import ForgeVideoBackground from '../../src/components/ForgeVideoBackground';
import { useTranslation } from '../../src/hooks/useTranslation';

interface EquipmentItem {
  name: string;
  category: string;
  has_weight: boolean;
  selected: boolean;
  min_weight?: number;
  max_weight?: number;
  default_resistance?: string;
  is_custom?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'free_weights', label: 'Free Weights' },
  { id: 'machines', label: 'Machines' },
  { id: 'bands', label: 'Bands' },
  { id: 'bodyweight', label: 'Bodyweight' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'functional', label: 'Functional' },
  { id: 'custom', label: 'Custom' },
];

export default function EquipmentOnboarding() {
  const router = useRouter();
  const { user, token, updateProfile } = useAuthStore();
  const { t } = useTranslation();
  const { fetchEquipmentCatalog, equipmentCatalog } = useWorkoutStore();
  
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCustomModal, setShowCustomModal] = useState(false);
  
  // Custom equipment form
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('custom');
  const [customHasWeight, setCustomHasWeight] = useState(false);
  const [customMinWeight, setCustomMinWeight] = useState('');
  const [customMaxWeight, setCustomMaxWeight] = useState('');
  
  // Weight unit preference
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(user?.weight_unit === 'lbs' ? 'lbs' : 'kg');

  useEffect(() => {
    if (token) {
      fetchEquipmentCatalog(token);
    }
  }, [token]);

  useEffect(() => {
    if (equipmentCatalog.length > 0) {
      const existingEquipment = user?.equipment || [];
      const customEquipment = user?.custom_equipment || [];
      const existingNames = existingEquipment.map((e: any) => e.name);
      
      const catalogItems = equipmentCatalog.map((item: any) => ({
        ...item,
        selected: existingNames.includes(item.name),
        min_weight: existingEquipment.find((e: any) => e.name === item.name)?.min_weight || 0,
        max_weight: existingEquipment.find((e: any) => e.name === item.name)?.max_weight || 0,
      }));
      
      // Add custom equipment
      const customItems = customEquipment.map((item: any) => ({
        ...item,
        selected: true,
        is_custom: true,
      }));
      
      setEquipment([...catalogItems, ...customItems]);
    }
  }, [equipmentCatalog, user]);

  const toggleEquipment = (index: number) => {
    const updated = [...equipment];
    updated[index].selected = !updated[index].selected;
    setEquipment(updated);
  };

  const updateWeight = (index: number, field: 'min_weight' | 'max_weight', value: string) => {
    const updated = [...equipment];
    const numValue = value ? parseFloat(value) : 0;
    // Convert to kg if user is using lbs
    updated[index][field] = weightUnit === 'lbs' ? Math.round(numValue * 0.453592 * 10) / 10 : numValue;
    setEquipment(updated);
  };
  
  const getDisplayWeight = (weightKg: number) => {
    if (weightUnit === 'lbs') {
      return Math.round(weightKg * 2.20462);
    }
    return weightKg;
  };

  const handleAddCustomEquipment = () => {
    if (!customName.trim()) {
      Alert.alert('Error', 'Please enter equipment name');
      return;
    }
    
    const newItem: EquipmentItem = {
      name: customName.trim(),
      category: customCategory,
      has_weight: customHasWeight,
      selected: true,
      min_weight: customHasWeight && customMinWeight ? 
        (weightUnit === 'lbs' ? parseFloat(customMinWeight) * 0.453592 : parseFloat(customMinWeight)) : 0,
      max_weight: customHasWeight && customMaxWeight ? 
        (weightUnit === 'lbs' ? parseFloat(customMaxWeight) * 0.453592 : parseFloat(customMaxWeight)) : 0,
      is_custom: true,
    };
    
    setEquipment([...equipment, newItem]);
    setShowCustomModal(false);
    setCustomName('');
    setCustomCategory('custom');
    setCustomHasWeight(false);
    setCustomMinWeight('');
    setCustomMaxWeight('');
  };

  const handleContinue = async () => {
    const selectedEquipment = equipment
      .filter((item) => item.selected && !item.is_custom)
      .map((item) => ({
        name: item.name,
        category: item.category,
        min_weight: item.min_weight || 0,
        max_weight: item.max_weight || 0,
        available: true,
      }));
    
    const customEquipment = equipment
      .filter((item) => item.selected && item.is_custom)
      .map((item) => ({
        name: item.name,
        category: item.category,
        has_weight: item.has_weight,
        min_weight: item.min_weight || 0,
        max_weight: item.max_weight || 0,
        is_custom: true,
      }));

    setLoading(true);
    try {
      if (token) {
        await saveEquipment(token, selectedEquipment);
      }
      await updateProfile({
        equipment: selectedEquipment,
        custom_equipment: customEquipment,
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
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/onboarding/location');
    }
  };

  const filteredEquipment = activeCategory === 'all'
    ? equipment
    : equipment.filter((item) => item.category === activeCategory || (activeCategory === 'custom' && item.is_custom));

  const selectedCount = equipment.filter((item) => item.selected).length;

  return (
    <View style={styles.root}>
      <ForgeVideoBackground />
      <View style={styles.contentLayer}>
      <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '80%' }]} />
        </View>

        <View style={styles.header}>
          <Text style={styles.step}>{t('step4')}</Text>
          <Text style={styles.title}>{t('your_equipment')}</Text>
          <Text style={styles.subtitle}>{t('equipment_subtitle')}</Text>
        </View>

        {/* Weight Unit Toggle */}
        <View style={styles.unitSection}>
          <Text style={styles.unitLabel}>Weight Unit:</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitButton, weightUnit === 'kg' && styles.unitButtonActive]}
              onPress={() => setWeightUnit('kg')}
            >
              <Text style={[styles.unitButtonText, weightUnit === 'kg' && styles.unitButtonTextActive]}>kg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, weightUnit === 'lbs' && styles.unitButtonActive]}
              onPress={() => setWeightUnit('lbs')}
            >
              <Text style={[styles.unitButtonText, weightUnit === 'lbs' && styles.unitButtonTextActive]}>lbs</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat) => (
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
        {/* Add Custom Equipment Button */}
        <TouchableOpacity style={styles.addCustomButton} onPress={() => setShowCustomModal(true)}>
          <Ionicons name="add-circle-outline" size={24} color="#76FF00" />
          <Text style={styles.addCustomText}>Add Custom Equipment</Text>
        </TouchableOpacity>

        {filteredEquipment.map((item, index) => {
          const originalIndex = equipment.findIndex((e) => e.name === item.name);
          return (
            <View key={item.name} style={[styles.equipmentCard, item.is_custom && styles.customEquipmentCard]}>
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
                  <View style={styles.equipmentNameRow}>
                    <Text style={[
                      styles.equipmentName,
                      item.selected && styles.equipmentNameSelected,
                    ]}>
                      {item.name}
                    </Text>
                    {item.is_custom && (
                      <View style={styles.customBadge}>
                        <Text style={styles.customBadgeText}>Custom</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.equipmentCategory}>{item.category}</Text>
                </View>
              </TouchableOpacity>

              {item.selected && item.has_weight && (
                <View style={styles.weightInputs}>
                  <View style={styles.weightField}>
                    <Text style={styles.weightLabel}>Min Weight ({weightUnit})</Text>
                    <TextInput
                      style={styles.weightInput}
                      value={item.min_weight ? getDisplayWeight(item.min_weight).toString() : ''}
                      onChangeText={(v) => updateWeight(originalIndex, 'min_weight', v)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666"
                    />
                  </View>
                  <View style={styles.weightField}>
                    <Text style={styles.weightLabel}>Max Weight ({weightUnit})</Text>
                    <TextInput
                      style={styles.weightInput}
                      value={item.max_weight ? getDisplayWeight(item.max_weight).toString() : ''}
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
          title={t('continue')}
          onPress={handleContinue}
          loading={loading}
          size="large"
        />
      </View>

      {/* Custom Equipment Modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Equipment</Text>
              <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Input
              label="Equipment Name *"
              placeholder="e.g., Resistance Loop Bands"
              value={customName}
              onChangeText={setCustomName}
              icon="barbell-outline"
            />

            <Text style={styles.modalLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollModal}>
              {['custom', 'free_weights', 'machines', 'bodyweight', 'cardio', 'functional'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChipModal, customCategory === cat && styles.categoryChipActiveModal]}
                  onPress={() => setCustomCategory(cat)}
                >
                  <Text style={[styles.categoryTextModal, customCategory === cat && styles.categoryTextActiveModal]}>
                    {cat.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.hasWeightToggle}
              onPress={() => setCustomHasWeight(!customHasWeight)}
            >
              <View style={[styles.checkbox, customHasWeight && styles.checkboxSelected]}>
                {customHasWeight && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.hasWeightText}>This equipment has adjustable weight/resistance</Text>
            </TouchableOpacity>

            {customHasWeight && (
              <View style={styles.weightInputsModal}>
                <View style={styles.weightFieldModal}>
                  <Input
                    label={`Min Weight (${weightUnit})`}
                    placeholder="0"
                    value={customMinWeight}
                    onChangeText={setCustomMinWeight}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.weightFieldModal}>
                  <Input
                    label={`Max Weight (${weightUnit})`}
                    placeholder="0"
                    value={customMaxWeight}
                    onChangeText={setCustomMaxWeight}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            <Button
              title="Add Equipment"
              onPress={handleAddCustomEquipment}
              style={styles.addButton}
              icon={<Ionicons name="add" size={20} color="#fff" />}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    elevation: 2,
  },
  container: {
    flex: 1,
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
    backgroundColor: '#76FF00',
    borderRadius: 2,
  },
  header: {
    marginBottom: 16,
  },
  step: {
    color: '#76FF00',
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
  unitSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  unitLabel: {
    color: '#888',
    fontSize: 14,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 2,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unitButtonActive: {
    backgroundColor: '#76FF00',
  },
  unitButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: '#fff',
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
    backgroundColor: '#76FF00',
    borderColor: '#76FF00',
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
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(118,255,0,0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#76FF00',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addCustomText: {
    color: '#76FF00',
    fontSize: 16,
    fontWeight: '600',
  },
  equipmentCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  customEquipmentCard: {
    borderColor: '#76FF00',
    borderWidth: 1,
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
    backgroundColor: '#76FF00',
    borderColor: '#76FF00',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  equipmentName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  equipmentNameSelected: {
    color: '#76FF00',
  },
  customBadge: {
    backgroundColor: 'rgba(118,255,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  customBadgeText: {
    color: '#76FF00',
    fontSize: 10,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  modalLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  categoryScrollModal: {
    marginBottom: 16,
  },
  categoryChipModal: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    marginRight: 8,
  },
  categoryChipActiveModal: {
    backgroundColor: '#76FF00',
  },
  categoryTextModal: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  categoryTextActiveModal: {
    color: '#fff',
  },
  hasWeightToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hasWeightText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 12,
  },
  weightInputsModal: {
    flexDirection: 'row',
    gap: 12,
  },
  weightFieldModal: {
    flex: 1,
  },
  addButton: {
    marginTop: 16,
  },
});
