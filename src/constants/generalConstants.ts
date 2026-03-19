import { GeneralSettings } from '../types';

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  techMonthlySalary: 50000,
  techMonthlyOverhead: 20000,
  workingDaysPerMonth: 22,
  usdExchangeRate: 35.0,
  fuelCostPerVisit: 500,
  parkingCostPerVisit: 200,
  locationMultiplier: {
    'İstanbul': 1.0,
    'Ankara': 1.1,
    'İzmir': 1.1,
    'Diğer': 1.5,
  },
  billingCycleMultiplier: {
    'Aylık': 1.1,
    'Üç Aylık': 1.05,
    'Yıllık': 1.0,
  },
  currency: 'TRY',
};
