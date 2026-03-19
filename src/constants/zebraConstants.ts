import { AdminSettings, ConfigState, CatalogItem } from '../types';

export const DEFAULT_ZEBRA_CATALOG: CatalogItem[] = [
  { id: 'z_ht', type: 'equipment', name: 'El Terminali', description: 'Handheld terminals', costType: 'hourly', costValue: 0.25, icon: 'monitor' },
  { id: 'z_bp', type: 'equipment', name: 'Barkod Yazıcı', description: 'Barcode printers', costType: 'hourly', costValue: 0.4, icon: 'video' },
  { id: 'z_it', type: 'equipment', name: 'Endüstriyel Tablet', description: 'Industrial tablets', costType: 'hourly', costValue: 0.3, icon: 'mic' },
  { id: 'z_mp', type: 'equipment', name: 'Mobil Yazıcı', description: 'Mobile printers', costType: 'hourly', costValue: 0.2, icon: 'speaker' },
  { id: 'z_rr', type: 'equipment', name: 'RFID Okuyucu', description: 'RFID readers', costType: 'hourly', costValue: 0.5, icon: 'settings' },
  { id: 'z_vmc', type: 'equipment', name: 'Araç Bilgisayarı', description: 'Vehicle mount computers', costType: 'hourly', costValue: 0.6, icon: 'box' },
  
  { id: 'z_srv_1', type: 'service', name: 'Full Kapsamlı Bakım (Comprehensive)', description: 'Full coverage for physical damage', costType: 'hourly', costValue: 0.5, icon: 'tool' },
  { id: 'z_srv_2', type: 'service', name: 'Yazılım Bakım ve Güncelleme', description: 'OS and application updates', costType: 'free', costValue: 0, icon: 'tool' },
  { id: 'z_srv_3', type: 'service', name: 'Pil Yönetim Hizmeti', description: 'Battery health monitoring', costType: 'per_unit', costValue: 10, unitCount: 1, icon: 'tool' },
  { id: 'z_srv_4', type: 'service', name: 'Yerinde Yedek Cihaz (Konsinye)', description: 'Spare device on customer site', costType: 'monthly', costValue: 100, icon: 'tool' },
];

export const DEFAULT_ZEBRA_CUSTOM_CONDITIONS = '1. Zebra cihazları için bakım hizmeti donanım onarımı ve yazılım desteğini kapsar.\n2. Kullanıcı kaynaklı ağır fiziksel hasarlar ek ücrete tabi olabilir.\n3. Pil değişimleri opsiyonel pakete dahildir.\n4. Standart onarım süresi 5 iş günüdür.';

export const DEFAULT_ZEBRA_ADMIN_SETTINGS: AdminSettings = {
  basePreventativeVisitHours: 1.5,
  remoteSupportBaseHours: 20,
  remoteSupportHoursPerRoom: 0, // No rooms in Zebra, maybe "per device" overhead?
  scaleDiscountThreshold: 10, // Higher threshold for devices
  scaleDiscountRatePerRoom: 0.5, // Lower percentage per device
  scaleMaxDiscount: 30,
  markupPercentage: 35,
  adhocCalculationMethod: 'markup',
  adhocMarkupPercentage: 120, // Higher for ad-hoc Zebra work
  fixedPerCallPrice: 800,
  catalog: DEFAULT_ZEBRA_CATALOG,
  servicePackages: [
    { 
      id: 'z_std', 
      label: 'Standart Paket', 
      incidentVisits: 4,
      proactiveVisits: 2,
      desc: 'Yılda 4 arıza müdahalesi ve 2 önleyici bakım.', 
    },
    { 
      id: 'z_pro', 
      label: 'Profesyonel Paket', 
      incidentVisits: 12,
      proactiveVisits: 4,
      desc: 'Yılda 12 arıza müdahalesi ve 4 önleyici bakım.', 
    },
    { 
      id: 'z_ent', 
      label: 'Kurumsal Paket', 
      incidentVisits: 24,
      proactiveVisits: 12,
      desc: 'Yılda 24 arıza müdahalesi ve 12 önleyici bakım. 7/24 Destek.',
    },
  ],
  globalIncludedServices: [
    'Donanım Arıza Tespiti',
    'Donanım Yazılımı (Firmware) Güncellemeleri',
    'Uzaktan Teknik Destek (Helpdesk)',
    'Online Arıza Takip Sistemi Erişimi',
    'Geri Gönderim Lojistiği (Kargo)',
  ],
  globalExcludedServices: [
    'Ekipman kayıpları ve hırsızlık',
    'Sarf malzemeleri (Label, Ribbon vb.)',
    'Müşteri uygulama yazılımları geliştirme',
    'Altyapı (Wireless/Network) genişletme',
  ],
  defaultCustomConditions: DEFAULT_ZEBRA_CUSTOM_CONDITIONS,
};

export const DEFAULT_ZEBRA_CONFIG_STATE: ConfigState = {
  clientName: '',
  projectName: '',
  locations: [],
  servicePackage: 'z_std',
  selectedAddons: [],
  incidentVisitsPerYear: 4,
  proactiveVisitsPerYear: 2,
  billingCycle: 'Yıllık',
  selectedServiceType: 'Zebra Yıllık Bakım',
  contractStartDate: new Date().toISOString().split('T')[0],
  contractDurationMonths: 12,
  customConditions: DEFAULT_ZEBRA_CUSTOM_CONDITIONS,
};

export const LOCATIONS = ['İstanbul', 'Ankara', 'İzmir', 'Diğer'] as const;
export const BILLING_CYCLES = ['Yıllık', 'Üç Aylık', 'Aylık'] as const;
