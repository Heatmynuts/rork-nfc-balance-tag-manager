import { Balance } from '@/types/balance';

export const mockBalances: Balance[] = [
  {
    id: '1',
    brand: 'Mettler Toledo',
    model: 'XS204',
    serialNumber: 'MT-2024-001',
    lastControlDate: '2024-01-15',
    nextControlDate: '2024-07-15',
    comment: 'Analytical balance - Lab A',
    nfcTagId: 'nfc_001'
  },
  {
    id: '2',
    brand: 'Sartorius',
    model: 'Entris II',
    serialNumber: 'SAR-2023-045',
    lastControlDate: '2024-03-20',
    nextControlDate: '2024-09-20',
    comment: 'Precision balance - Quality Control',
    nfcTagId: 'nfc_002'
  },
  {
    id: '3',
    brand: 'Ohaus',
    model: 'Pioneer PA',
    serialNumber: 'OH-2024-012',
    lastControlDate: '2023-12-10',
    nextControlDate: '2024-06-10',
    comment: 'General purpose balance - Production',
    nfcTagId: 'nfc_003'
  },
  {
    id: '4',
    brand: 'Kern',
    model: 'ABJ 220-4NM',
    serialNumber: 'KRN-2024-007',
    lastControlDate: '2024-02-28',
    nextControlDate: '2024-08-28',
    comment: 'Analytical balance - Research Lab',
    nfcTagId: 'nfc_004'
  },
  {
    id: '5',
    brand: 'Adam Equipment',
    model: 'Luna LAB',
    serialNumber: 'AE-2023-089',
    lastControlDate: '2024-01-05',
    nextControlDate: '2024-07-05',
    comment: 'Compact balance - Mobile unit',
    nfcTagId: 'nfc_005'
  }
];