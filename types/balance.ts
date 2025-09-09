export interface Balance {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  lastControlDate: string;
  nextControlDate: string;
  comment: string;
  nfcTagId?: string;
}

export type BalanceStatus = 'overdue' | 'due-soon' | 'up-to-date';

export interface BalanceWithStatus extends Balance {
  status: BalanceStatus;
  daysUntilDue: number;
}