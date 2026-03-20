export type Location = 'İstanbul' | 'Ankara' | 'İzmir' | 'Diğer';
export type BillingCycle = 'Aylık' | 'Üç Aylık' | 'Yıllık';
export type ServiceType = 
  | 'AV Yıllık Bakım Hizmeti'
  | 'AV Kurulum'
  | 'Zebra Yıllık Bakım'
  | 'Zebra Kurulum'
  | 'IT Kurulum'
  | 'IT Yıllık Bakım';
export type EquipmentType = 'Screen' | 'VideoConferencing' | 'CeilingMic' | 'AudioDSP' | 'ControlSystem' | 'Other';
export type ServicePackage = string; // Now dynamic, 'custom' is reserved

export interface ServicePackageDef {
  id: string;
  label: string;
  incidentVisits: number;
  proactiveVisits: number;
  desc: string;
  maxRooms?: number;
}

export type CostType = 'free' | 'hourly' | 'monthly' | 'annual' | 'per_unit';

export interface CatalogItem {
  id: string;
  type: 'equipment' | 'service';
  name: string;
  description: string;
  costType: CostType;
  costValue: number; // Hours if hourly, Currency if monthly/annual/per_unit
  unitCount?: number; // For per_unit cost type
  icon?: string;
  isDefaultRoomEquipment?: boolean; // If true, added automatically to new rooms
}

export interface Equipment {
  id: string;
  catalogId: string;
  quantity: number;
}

export interface Room {
  id: string;
  name: string;
  equipment: Equipment[];
}

export interface ProjectLocation {
  id: string;
  name: string;
  city: Location;
  rooms?: Room[];
  equipment?: Equipment[]; // For product-based categories like Zebra
}

export interface SelectedAddon {
  id: string;
  quantity: number;
}

export interface ConfigState {
  clientName: string;
  projectName: string;
  locations: ProjectLocation[];
  servicePackage: ServicePackage;
  selectedAddons: SelectedAddon[];
  incidentVisitsPerYear: number;
  proactiveVisitsPerYear: number;
  billingCycle: BillingCycle;
  selectedServiceType: ServiceType;
  contractStartDate: string;
  contractDurationMonths: number;
  customConditions: string;
}

export interface AddonDetail {
  id: string;
  name: string;
  quantity: number;
  cost: number;
  price: number;
}

export interface CalculatedCosts {
  hourlyRate: number;
  totalAnnualHours: number;
  annualBaseCost: number;
  annualPrice: number;
  periodicPrice: number;
  adhocAnnualPrice: number;
  breakdown: {
    equipmentHours: number;
    scaleDiscountHours?: number;
    visitHours: number;
    proactiveHours: number;
    totalLogisticsCost: number;
    fixedEquipmentCost: number;
    fixedServiceCost: number;
    // Costs including markup
    equipmentCost: number;
    visitCost: number;
    proactiveCost: number;
    logisticsCost: number;
    // Add-on specific
    addonCost: number;
    addonDetails: AddonDetail[];
  };
}

export interface GeneralSettings {
  techMonthlySalary: number;
  techMonthlyOverhead: number;
  workingDaysPerMonth: number;
  usdExchangeRate: number;
  fuelCostPerVisit: number;
  parkingCostPerVisit: number;
  locationMultiplier: Record<Location, number>;
  billingCycleMultiplier: Record<BillingCycle, number>;
  currency: 'TRY' | 'USD';
  defaultCustomConditions: string;
}

export interface AdminSettings {
  basePreventativeVisitHours: number;
  remoteSupportBaseHours: number;
  remoteSupportHoursPerRoom: number;
  scaleDiscountThreshold: number;
  scaleDiscountRatePerRoom: number;
  scaleMaxDiscount: number;
  markupPercentage: number;
  adhocCalculationMethod?: 'markup' | 'fixed_visit';
  adhocMarkupPercentage: number;
  fixedPerCallPrice?: number;
  servicePackages: ServicePackageDef[];
  globalIncludedServices: string[];
  globalExcludedServices: string[];
  catalog: CatalogItem[];
}
