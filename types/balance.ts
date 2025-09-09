export interface Balance {
  id: string;
  name: string;
  currentAmount: number;
  currency: string;
  lastUpdated: string;
  nextControlDate: string;
  nfcTagId?: string;
}

export type BalanceStatus = 'overdue' | 'due-soon' | 'up-to-date';

export interface BalanceWithStatus extends Balance {
  status: BalanceStatus;
  daysUntilDue: number;
}
