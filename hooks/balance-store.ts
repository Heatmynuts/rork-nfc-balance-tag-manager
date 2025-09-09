import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Balance, BalanceWithStatus, BalanceStatus } from '@/types/balance';
import { mockBalances } from '@/constants/balances';

const STORAGE_KEY = 'balances';

function getBalanceStatus(nextControlDate: string): { status: BalanceStatus; daysUntilDue: number } {
  const today = new Date();
  const dueDate = new Date(nextControlDate);
  const diffTime = dueDate.getTime() - today.getTime();
  const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) {
    return { status: 'overdue', daysUntilDue };
  } else if (daysUntilDue <= 30) {
    return { status: 'due-soon', daysUntilDue };
  } else {
    return { status: 'up-to-date', daysUntilDue };
  }
}

export const [BalanceProvider, useBalances] = createContextHook(() => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const queryClient = useQueryClient();

  const balancesQuery = useQuery({
    queryKey: ['balances'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored) as Balance[];
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockBalances));
          return mockBalances;
        }
      } catch (error) {
        console.error('Error loading balances:', error);
        return mockBalances;
      }
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (newBalances: Balance[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newBalances));
      return newBalances;
    },
    onSuccess: (data) => {
      setBalances(data);
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    }
  });

  useEffect(() => {
    if (balancesQuery.data) {
      setBalances(balancesQuery.data);
    }
  }, [balancesQuery.data]);

  const balancesWithStatus: BalanceWithStatus[] = useMemo(() => {
    return balances.map(balance => {
      const { status, daysUntilDue } = getBalanceStatus(balance.nextControlDate);
      return { ...balance, status, daysUntilDue };
    });
  }, [balances]);

  const { mutate: mutateSave } = saveMutation;

  const addBalance = useCallback((balance: Omit<Balance, 'id'>) => {
    const newBalance: Balance = {
      ...balance,
      id: Date.now().toString()
    };
    const updated = [...balances, newBalance];
    mutateSave(updated);
  }, [balances, mutateSave]);

  const updateBalance = useCallback((id: string, updates: Partial<Balance>) => {
    const updated = balances.map(balance =>
      balance.id === id ? { ...balance, ...updates } : balance
    );
    mutateSave(updated);
  }, [balances, mutateSave]);

  const deleteBalance = useCallback((id: string) => {
    const updated = balances.filter(balance => balance.id !== id);
    mutateSave(updated);
  }, [balances, mutateSave]);

  const findBalanceByNfcTag = useCallback((nfcTagId: string): Balance | undefined => {
    return balances.find(balance => balance.nfcTagId === nfcTagId);
  }, [balances]);

  const getStatusCounts = useCallback(() => {
    const counts = { overdue: 0, 'due-soon': 0, 'up-to-date': 0 };
    balancesWithStatus.forEach(balance => {
      counts[balance.status]++;
    });
    return counts;
  }, [balancesWithStatus]);

  return useMemo(() => ({
    balances: balancesWithStatus,
    isLoading: balancesQuery.isLoading,
    addBalance,
    updateBalance,
    deleteBalance,
    findBalanceByNfcTag,
    getStatusCounts,
    isSaving: saveMutation.isPending
  }), [balancesWithStatus, balancesQuery.isLoading, addBalance, updateBalance, deleteBalance, findBalanceByNfcTag, getStatusCounts, saveMutation.isPending]);
});