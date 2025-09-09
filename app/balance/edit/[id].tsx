import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Save, X } from 'lucide-react-native';
import { useBalances } from '@/hooks/balance-store';
import DatePicker from '@/components/DatePicker';

export default function EditBalanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { balances, updateBalance } = useBalances();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    lastControlDate: '',
    nextControlDate: '',
    comment: '',
    nfcTagId: ''
  });

  const balance = balances.find(b => b.id === id);

  useEffect(() => {
    if (balance) {
      setFormData({
        brand: balance.brand,
        model: balance.model,
        serialNumber: balance.serialNumber,
        lastControlDate: balance.lastControlDate,
        nextControlDate: balance.nextControlDate,
        comment: balance.comment,
        nfcTagId: balance.nfcTagId || ''
      });
    }
  }, [balance]);

  if (!balance) {
    return (
      <>
        <Stack.Screen options={{ title: 'Balance Not Found' }} />
        <View style={styles.container}>
          <Text style={styles.errorText}>Balance not found</Text>
        </View>
      </>
    );
  }

  const handleSave = () => {
    if (!formData.brand || !formData.model || !formData.serialNumber) {
      if (Platform.OS === 'web') {
        alert('Please fill in all required fields (Brand, Model, Serial Number)');
      } else {
        Alert.alert('Error', 'Please fill in all required fields (Brand, Model, Serial Number)');
      }
      return;
    }

    if (!formData.lastControlDate || !formData.nextControlDate) {
      if (Platform.OS === 'web') {
        alert('Please fill in both control dates');
      } else {
        Alert.alert('Error', 'Please fill in both control dates');
      }
      return;
    }

    updateBalance(balance.id, formData);
    router.back();
  };



  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Edit Balance',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color="#FF3B30" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave}>
              <Save size={24} color="#3498DB" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brand *</Text>
            <TextInput
              style={styles.input}
              value={formData.brand}
              onChangeText={(text) => setFormData({ ...formData, brand: text })}
              placeholder="e.g., Mettler Toledo"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Model *</Text>
            <TextInput
              style={styles.input}
              value={formData.model}
              onChangeText={(text) => setFormData({ ...formData, model: text })}
              placeholder="e.g., XS204"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Serial Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.serialNumber}
              onChangeText={(text) => setFormData({ ...formData, serialNumber: text })}
              placeholder="e.g., MT-2024-001"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>NFC Tag ID</Text>
            <TextInput
              style={styles.input}
              value={formData.nfcTagId}
              onChangeText={(text) => setFormData({ ...formData, nfcTagId: text })}
              placeholder="e.g., nfc_001"
            />
          </View>

          <DatePicker
            label="Last Control Date"
            value={formData.lastControlDate}
            onDateChange={(date) => setFormData({ ...formData, lastControlDate: date })}
            placeholder="Select last control date"
            required
          />

          <DatePicker
            label="Next Control Date"
            value={formData.nextControlDate}
            onDateChange={(date) => setFormData({ ...formData, nextControlDate: date })}
            placeholder="Select next control date"
            required
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Comment</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.comment}
              onChangeText={(text) => setFormData({ ...formData, comment: text })}
              placeholder="Additional notes about this balance"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="white" />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  contentContainer: {
    padding: 20
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#FAFAFA'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  saveButton: {
    backgroundColor: '#3498DB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  errorText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 100
  }
});