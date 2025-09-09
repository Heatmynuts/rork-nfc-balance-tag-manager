import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Edit, Trash2, Scale, Hash, Calendar, MessageSquare, Tag } from 'lucide-react-native';
import { useBalances } from '@/hooks/balance-store';
import { StatusBadge } from '@/components/StatusBadge';

export default function BalanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { balances, deleteBalance } = useBalances();
  
  const balance = balances.find(b => b.id === id);

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

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirmed = confirm('Are you sure you want to delete this balance? This action cannot be undone.');
      if (confirmed) {
        deleteBalance(balance.id);
        router.back();
      }
    } else {
      Alert.alert(
        'Delete Balance',
        'Are you sure you want to delete this balance? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteBalance(balance.id);
              router.back();
            }
          }
        ]
      );
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: balance.brand,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => router.push(`/balance/edit/${balance.id}`)}
                style={styles.headerButton}
              >
                <Edit size={20} color="#3498DB" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.headerButton}
              >
                <Trash2 size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Scale size={32} color="#2C3E50" />
            <View style={styles.titleText}>
              <Text style={styles.brand}>{balance.brand}</Text>
              <Text style={styles.model}>{balance.model}</Text>
            </View>
          </View>
          <StatusBadge status={balance.status} daysUntilDue={balance.daysUntilDue} />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Hash size={20} color="#7F8C8D" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Serial Number</Text>
              <Text style={styles.infoValue}>{balance.serialNumber}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Tag size={20} color="#7F8C8D" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>NFC Tag ID</Text>
              <Text style={styles.infoValue}>{balance.nfcTagId || 'Not assigned'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={20} color="#7F8C8D" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Last Control Date</Text>
              <Text style={styles.infoValue}>
                {new Date(balance.lastControlDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={20} color="#7F8C8D" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Next Control Date</Text>
              <Text style={styles.infoValue}>
                {new Date(balance.nextControlDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {balance.comment && (
            <View style={styles.infoRow}>
              <MessageSquare size={20} color="#7F8C8D" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Comment</Text>
                <Text style={styles.infoValue}>{balance.comment}</Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/balance/edit/${balance.id}`)}
        >
          <Edit size={20} color="white" />
          <Text style={styles.editButtonText}>Edit Balance</Text>
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
  headerButtons: {
    flexDirection: 'row'
  },
  headerButton: {
    marginLeft: 16,
    padding: 4
  },
  header: {
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  titleText: {
    marginLeft: 16,
    flex: 1
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  model: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 4
  },
  infoCard: {
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  infoContent: {
    marginLeft: 16,
    flex: 1
  },
  infoLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
    marginBottom: 4
  },
  infoValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500'
  },
  editButton: {
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
  editButtonText: {
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