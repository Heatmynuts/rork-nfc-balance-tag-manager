import { Balance } from '@/types/balance';

export const mockBalances: Balance[] = [
  {
    id: '1',
    name: 'Balance Mettler Toledo',
    currentAmount: 25.50,
    currency: 'EUR', 
    lastUpdated: '2024-01-15',
    nextControlDate: '2024-07-15',
    nfcTagId: 'nfc_001'
  },
  {
    id: '2',
    name: 'Balance Sartorius',
    currentAmount: 15.30,
    currency: 'EUR',
    lastUpdated: '2024-03-20', 
    nextControlDate: '2024-09-20',
    nfcTagId: 'nfc_002'
  }
];
