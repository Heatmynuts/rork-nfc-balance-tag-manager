import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Scale, Calendar, Hash } from 'lucide-react-native';
import { BalanceWithStatus } from '@/types/balance';
import { StatusBadge } from './StatusBadge';

interface BalanceCardProps {
  balance: BalanceWithStatus;
  onPress: () => void;
}

export function BalanceCard({ balance, onPress }: BalanceCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Scale size={20} color="#2C3E50" />
          <Text style={styles.brand}>{balance.brand}</Text>
        </View>
        <StatusBadge status={balance.status} daysUntilDue={balance.daysUntilDue} size="small" />
      </View>
      
      <Text style={styles.model}>{balance.model}</Text>
      
      <View style={styles.infoRow}>
        <Hash size={14} color="#7F8C8D" />
        <Text style={styles.serialNumber}>{balance.serialNumber}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Calendar size={14} color="#7F8C8D" />
        <Text style={styles.date}>Next control: {new Date(balance.nextControlDate).toLocaleDateString()}</Text>
      </View>
      
      {balance.comment && (
        <Text style={styles.comment} numberOfLines={2}>
          {balance.comment}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  brand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8
  },
  model: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 12,
    marginLeft: 28
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  serialNumber: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 6
  },
  date: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 6
  },
  comment: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 8,
    fontStyle: 'italic'
  }
});