import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Save, X, Nfc, Zap } from 'lucide-react-native';
import { useBalances } from '@/hooks/balance-store';
import DatePicker from '@/components/DatePicker';
import * as Haptics from 'expo-haptics';

export default function AddBalanceScreen() {
  const { addBalance } = useBalances();
  const { nfcTag } = useLocalSearchParams<{ nfcTag?: string }>();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    lastControlDate: '',
    nextControlDate: '',
    comment: '',
    nfcTagId: ''
  });

  useEffect(() => {
    if (nfcTag) {
      setFormData(prev => ({ ...prev, nfcTagId: nfcTag }));
    }
  }, [nfcTag]);

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

    addBalance(formData);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    router.back();
  };

  const handleWriteNfcTag = async () => {
    if (!formData.brand || !formData.model || !formData.serialNumber) {
      Alert.alert('Error', 'Please fill in the basic balance information first.');
      return;
    }

    if (Platform.OS === 'web') {
      // Web NFC writing
      try {
        if ('NDEFReader' in window) {
          const ndef = new (window as any).NDEFReader();
          const balanceData = {
            brand: formData.brand,
            model: formData.model,
            serialNumber: formData.serialNumber,
            id: Date.now().toString()
          };
          
          await ndef.write({
            records: [{
              recordType: "text",
              data: JSON.stringify(balanceData)
            }]
          });
          
          const newNfcId = `nfc_${Date.now()}`;
          setFormData(prev => ({ ...prev, nfcTagId: newNfcId }));
          
          Alert.alert('Success', 'NFC tag written successfully!');
        } else {
          Alert.alert('Error', 'Web NFC is not supported on this device.');
        }
      } catch (error) {
        console.error('NFC write error:', error);
        Alert.alert('Error', 'Failed to write NFC tag. Make sure NFC is enabled and tag is writable.');
      }
    } else {
      // Mobile NFC writing simulation
      Alert.alert(
        'Write NFC Tag',
        'Hold your device near a writable NFC tag to program it with this balance information.',
        [
          {
            text: 'Start Writing',
            onPress: async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              
              // Simulate NFC writing process
              setTimeout(async () => {
                const newNfcId = `nfc_${Date.now()}`;
                setFormData(prev => ({ ...prev, nfcTagId: newNfcId }));
                
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Success', 'NFC tag programmed successfully!');
              }, 2000);
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };



  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Add Balance',
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
            <Text style={styles.label}>NFC Tag ID {nfcTag && '(Auto-filled from scan)'}</Text>
            <View style={styles.nfcInputContainer}>
              <Nfc size={20} color={nfcTag ? '#27AE60' : '#7F8C8D'} style={styles.nfcIcon} />
              <TextInput
                style={[styles.input, styles.nfcInput, nfcTag && styles.nfcInputFilled]}
                value={formData.nfcTagId}
                onChangeText={(text) => setFormData({ ...formData, nfcTagId: text })}
                placeholder="e.g., nfc_001"
                editable={!nfcTag}
              />
            </View>
            {nfcTag && (
              <Text style={styles.nfcHint}>
                This NFC tag was detected during scanning. You can edit it if needed.
              </Text>
            )}
            
            {!nfcTag && (
              <TouchableOpacity style={styles.writeNfcButton} onPress={handleWriteNfcTag}>
                <Zap size={16} color="#3498DB" />
                <Text style={styles.writeNfcButtonText}>Write to NFC Tag</Text>
              </TouchableOpacity>
            )}
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
          <Text style={styles.saveButtonText}>Save Balance</Text>
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
  nfcInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative'
  },
  nfcIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1
  },
  nfcInput: {
    paddingLeft: 40,
    flex: 1
  },
  nfcInputFilled: {
    backgroundColor: '#E8F5E8',
    borderColor: '#27AE60'
  },
  nfcHint: {
    fontSize: 12,
    color: '#27AE60',
    marginTop: 4,
    fontStyle: 'italic'
  },
  writeNfcButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3498DB',
    borderStyle: 'dashed'
  },
  writeNfcButtonText: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '500',
    marginLeft: 6
  }
});