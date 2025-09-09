import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BalanceStatus } from '@/types/balance';

interface StatusBadgeProps {
  status: BalanceStatus;
  daysUntilDue: number;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, daysUntilDue, size = 'medium' }: StatusBadgeProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'overdue':
        return {
          color: '#FF3B30',
          backgroundColor: '#FFE5E5',
          text: `Overdue ${Math.abs(daysUntilDue)} days`,
          textColor: '#D70015'
        };
      case 'due-soon':
        return {
          color: '#FF9500',
          backgroundColor: '#FFF4E5',
          text: `Due in ${daysUntilDue} days`,
          textColor: '#CC7700'
        };
      case 'up-to-date':
        return {
          color: '#34C759',
          backgroundColor: '#E8F5E8',
          text: `${daysUntilDue} days left`,
          textColor: '#248A3D'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const isSmall = size === 'small';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: statusInfo.backgroundColor },
      isSmall && styles.badgeSmall
    ]}>
      <View style={[
        styles.indicator,
        { backgroundColor: statusInfo.color },
        isSmall && styles.indicatorSmall
      ]} />
      <Text style={[
        styles.text,
        { color: statusInfo.textColor },
        isSmall && styles.textSmall
      ]}>
        {statusInfo.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start'
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  indicatorSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4
  },
  text: {
    fontSize: 12,
    fontWeight: '600'
  },
  textSmall: {
    fontSize: 10
  }
});