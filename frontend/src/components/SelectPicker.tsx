import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BRAND_GREEN = '#76FF00';

interface PickerItem {
  label: string;
  sublabel?: string;
  value: string;
  icon?: string;
}

interface SelectPickerProps {
  label?: string;
  placeholder?: string;
  value: string;
  onSelect: (value: string, item: PickerItem) => void;
  items: PickerItem[];
  searchable?: boolean;
  icon?: string;
}

export function SelectPicker({
  label,
  placeholder = 'Select...',
  value,
  onSelect,
  items,
  searchable = true,
  icon,
}: SelectPickerProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(search.toLowerCase()) ||
        (i.sublabel && i.sublabel.toLowerCase().includes(search.toLowerCase()))
    );
  }, [items, search]);

  const selected = items.find((i) => i.value === value);

  return (
    <>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
        {icon && (
          <Ionicons name={icon as any} size={18} color="#888" style={styles.triggerIcon} />
        )}
        {selected?.icon && !icon && (
          <Text style={styles.flagIcon}>{selected.icon}</Text>
        )}
        <Text style={[styles.triggerText, !selected && styles.placeholder]}>
          {selected ? (selected.icon ? `${selected.icon}  ${selected.label}` : selected.label) : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label || placeholder}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {searchable && (
            <View style={styles.searchBar}>
              <Ionicons name="search" size={16} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#666"
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, item.value === value && styles.optionSelected]}
                onPress={() => {
                  onSelect(item.value, item);
                  setVisible(false);
                  setSearch('');
                }}
              >
                {item.icon && <Text style={styles.optionIcon}>{item.icon}</Text>}
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, item.value === value && styles.optionLabelSelected]}>
                    {item.label}
                  </Text>
                  {item.sublabel && (
                    <Text style={styles.optionSublabel}>{item.sublabel}</Text>
                  )}
                </View>
                {item.value === value && (
                  <Ionicons name="checkmark-circle" size={20} color={BRAND_GREEN} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  triggerIcon: { marginRight: 10 },
  flagIcon: { fontSize: 18, marginRight: 10 },
  triggerText: { flex: 1, color: '#fff', fontSize: 15 },
  placeholder: { color: '#555' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  sheetTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  optionSelected: { backgroundColor: 'rgba(118,255,0,0.06)' },
  optionIcon: { fontSize: 22, marginRight: 14, width: 30 },
  optionText: { flex: 1 },
  optionLabel: { color: '#fff', fontSize: 15 },
  optionLabelSelected: { color: BRAND_GREEN, fontWeight: '600' },
  optionSublabel: { color: '#666', fontSize: 12, marginTop: 2 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#555', fontSize: 15 },
});
