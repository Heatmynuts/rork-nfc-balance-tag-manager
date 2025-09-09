import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Filter } from 'lucide-react-native';
import { useBalances } from '@/hooks/balance-store';
import { BalanceCard } from '@/components/BalanceCard';
import { BalanceWithStatus, BalanceStatus } from '@/types/balance';

export default function BalancesScreen() {
  const { balances } = useBalances();
  const [filter, setFilter] = useState<BalanceStatus | 'all'>('all');

  const filteredBalances = filter === 'all' 
    ? balances 
    : balances.filter(balance => balance.status === filter);

  const getFilterButtonStyle = (filterType: BalanceStatus | 'all') => [
    styles.filterButton,
    filter === filterType && styles.filterButtonActive
  ];

  const getFilterTextStyle = (filterType: BalanceStatus | 'all') => [
    styles.filterButtonText,
    filter === filterType && styles.filterButtonTextActive
  ];

  const renderBalance = ({ item }: { item: BalanceWithStatus }) => (
    <BalanceCard
      balance={item}
      onPress={() => router.push(`/balance/${item.id}`)}
    />
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Balances',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/balance/add')}
              style={styles.addButton}
            >
              <Plus size={24} color="#3498DB" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <Filter size={16} color="#7F8C8D" />
          <Text style={styles.filterLabel}>Filter:</Text>
          
          <TouchableOpacity
            style={getFilterButtonStyle('all')}
            onPress={() => setFilter('all')}
          >
            <Text style={getFilterTextStyle('all')}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('overdue')}
            onPress={() => setFilter('overdue')}
          >
            <Text style={getFilterTextStyle('overdue')}>Overdue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('due-soon')}
            onPress={() => setFilter('due-soon')}
          >
            <Text style={getFilterTextStyle('due-soon')}>Due Soon</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('up-to-date')}
            onPress={() => setFilter('up-to-date')}
          >
            <Text style={getFilterTextStyle('up-to-date')}>Up to Date</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredBalances}
          renderItem={renderBalance}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {filter === 'all' ? 'No balances registered' : `No ${filter.replace('-', ' ')} balances`}
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  addButton: {
    padding: 4
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  filterLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 8,
    marginRight: 12
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    marginRight: 8
  },
  filterButtonActive: {
    backgroundColor: '#3498DB'
  },
  filterButtonText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500'
  },
  filterButtonTextActive: {
    color: 'white'
  },
  listContainer: {
    paddingVertical: 8
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center'
  }
});