import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Nfc, Scan, TrendingUp, AlertTriangle, Clock, Plus } from 'lucide-react-native';
import { useBalances } from '@/hooks/balance-store';
import * as Haptics from 'expo-haptics';

declare global {
  interface Window {
    NDEFReader: any;
  }
}

export default function HomeScreen() {
  const { findBalanceByNfcTag, getStatusCounts, balances } = useBalances();
  const [isScanning, setIsScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcReader, setNfcReader] = useState<any>(null);
  const statusCounts = getStatusCounts();

  useEffect(() => {
    checkNfcSupport();
  }, []);

  const checkNfcSupport = async () => {
    if (Platform.OS === 'web') {
      // Check for Web NFC API support
      if ('NDEFReader' in window) {
        setNfcSupported(true);
        setNfcReader(new window.NDEFReader());
      }
    } else {
      // For Expo Go, NFC hardware access is limited
      // In production with dev client, you would use expo-nfc
      setNfcSupported(true);
      console.log('Mobile NFC simulation mode enabled for Expo Go');
    }
  };

  const startNfcScan = async () => {
    if (!nfcSupported) {
      Alert.alert('NFC Not Supported', 'NFC is not supported on this device.');
      return;
    }

    setIsScanning(true);
    
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      if (Platform.OS === 'web' && nfcReader) {
        // Real Web NFC implementation
        await nfcReader.scan();
        
        nfcReader.addEventListener('reading', ({ message, serialNumber }: any) => {
          console.log('NFC tag detected:', serialNumber);
          handleNfcTagDetected(serialNumber || 'web_nfc_' + Date.now());
        });
        
        nfcReader.addEventListener('readingerror', () => {
          console.log('NFC reading error');
          setIsScanning(false);
          Alert.alert('NFC Error', 'Failed to read NFC tag. Please try again.');
        });
        
        // Auto-stop scanning after 30 seconds
        setTimeout(() => {
          if (isScanning) {
            stopNfcScan();
          }
        }, 30000);
      } else {
        // Mobile: Simulate NFC scanning for Expo Go
        // In production with dev client, you would use real NFC APIs
        console.log('Starting NFC scan simulation on mobile...');
        
        // Show scanning interface
        Alert.alert(
          'NFC Scanning Active',
          'Ready to scan NFC tags. In Expo Go, this is simulated. With a dev client build, this would scan real NFC tags.',
          [
            { text: 'Cancel', onPress: () => setIsScanning(false) },
            { text: 'Simulate Tag Detection', onPress: () => simulateNfcDetection() }
          ]
        );
        
        // Auto-stop scanning after 30 seconds
        const timeout = setTimeout(() => {
          if (isScanning) {
            setIsScanning(false);
            Alert.alert('Scan Timeout', 'NFC scanning stopped. No tag was detected.');
          }
        }, 30000);
        
        setNfcReader({ timeout });
      }
    } catch (error) {
      console.error('NFC scan error:', error);
      setIsScanning(false);
      Alert.alert('NFC Error', 'Failed to start NFC scanning. Please try again.');
    }
  };

  const stopNfcScan = () => {
    setIsScanning(false);
    
    if (Platform.OS === 'web' && nfcReader && nfcReader.stop) {
      try {
        nfcReader.stop();
      } catch (error) {
        console.log('Error stopping NFC scan:', error);
      }
    } else if (Platform.OS !== 'web' && nfcReader) {
      // Clear timeout on mobile simulation
      try {
        if (nfcReader.timeout) {
          clearTimeout(nfcReader.timeout);
        }
        setNfcReader(null);
      } catch (error) {
        console.log('Error stopping NFC scan:', error);
      }
    }
  };

  const simulateNfcDetection = () => {
    const mockNfcTags = ['nfc_001', 'nfc_002', 'nfc_003', 'nfc_004', 'nfc_005', 'new_tag_' + Date.now()];
    const randomTag = mockNfcTags[Math.floor(Math.random() * mockNfcTags.length)];
    console.log('Simulating NFC tag detection:', randomTag);
    handleNfcTagDetected(randomTag);
  };

  const handleNfcTagDetected = async (tagId: string) => {
    setIsScanning(false);
    
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    const foundBalance = findBalanceByNfcTag(tagId);
    
    if (foundBalance) {
      // Get balance with status from the store
      const balanceWithStatus = balances.find(b => b.id === foundBalance.id);
      
      Alert.alert(
        'Balance Found',
        `${foundBalance.brand} ${foundBalance.model}\nSerial: ${foundBalance.serialNumber}\nStatus: ${balanceWithStatus?.status || 'Unknown'}`,
        [
          { text: 'View Details', onPress: () => router.push(`/balance/${foundBalance.id}`) },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert(
        'Unknown NFC Tag',
        'This NFC tag is not registered in the system. Would you like to register a new balance?',
        [
          { 
            text: 'Register New Balance', 
            onPress: () => router.push(`/balance/add?nfcTag=${tagId}`) 
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'NFC Balance Scanner' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Balance Management</Text>
          <Text style={styles.subtitle}>Scan NFC tags to access balance information</Text>
        </View>

        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanButtonActive]}
          onPress={startNfcScan}
          disabled={isScanning || !nfcSupported}
          activeOpacity={0.8}
        >
          <View style={styles.scanButtonContent}>
            {isScanning ? (
              <Scan size={48} color="white" />
            ) : (
              <Nfc size={48} color="white" />
            )}
            <Text style={styles.scanButtonText}>
              {!nfcSupported ? 'NFC Not Available' : isScanning ? 'Scanning...' : 'Scan NFC Tag'}
            </Text>
            <Text style={styles.scanButtonSubtext}>
              {!nfcSupported 
                ? 'NFC is not supported on this device' 
                : isScanning 
                  ? 'Hold your device near the NFC tag' 
                  : 'Place device near balance NFC tag'
              }
            </Text>
            {isScanning && (
              <TouchableOpacity style={styles.stopButton} onPress={stopNfcScan}>
                <Text style={styles.stopButtonText}>Stop Scanning</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>System Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp size={24} color="#34C759" />
              </View>
              <Text style={styles.statNumber}>{statusCounts['up-to-date']}</Text>
              <Text style={styles.statLabel}>Up to Date</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Clock size={24} color="#FF9500" />
              </View>
              <Text style={styles.statNumber}>{statusCounts['due-soon']}</Text>
              <Text style={styles.statLabel}>Due Soon</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <AlertTriangle size={24} color="#FF3B30" />
              </View>
              <Text style={styles.statNumber}>{statusCounts.overdue}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/balance/add')}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>Add New Balance</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to use</Text>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>Locate the NFC tag on the balance</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>Tap "Scan NFC Tag" and hold device near tag</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>View balance information and control dates</Text>
          </View>
          
          {Platform.OS !== 'web' && (
            <View style={styles.expoGoNote}>
              <Text style={styles.expoGoNoteText}>
                📱 In Expo Go, NFC scanning is simulated. For real NFC functionality, build with EAS and use a dev client.
              </Text>
            </View>
          )}
          
          {Platform.OS === 'web' && !nfcSupported && (
            <View style={styles.webNfcNote}>
              <Text style={styles.webNfcNoteText}>
                💡 Web NFC requires HTTPS and is supported in Chrome/Edge on Android.
                For full NFC functionality, use the mobile app.
              </Text>
            </View>
          )}
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center'
  },
  scanButton: {
    backgroundColor: '#3498DB',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  scanButtonActive: {
    backgroundColor: '#2980B9'
  },
  scanButtonContent: {
    alignItems: 'center'
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12
  },
  scanButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center'
  },
  statsContainer: {
    marginBottom: 30
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statIcon: {
    marginBottom: 8
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center'
  },
  instructionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3498DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  instructionNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  instructionText: {
    fontSize: 14,
    color: '#34495E',
    flex: 1
  },
  stopButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  stopButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500'
  },
  actionsContainer: {
    marginBottom: 20
  },
  addButton: {
    backgroundColor: '#27AE60',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  expoGoNote: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  expoGoNoteText: {
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 16
  },
  webNfcNote: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107'
  },
  webNfcNoteText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16
  }
});