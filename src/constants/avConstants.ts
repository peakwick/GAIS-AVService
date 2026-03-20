import { AdminSettings, ConfigState, CatalogItem } from '../types';

export const DEFAULT_CATALOG: CatalogItem[] = [
  { id: 'eq_screen', type: 'equipment', name: 'Ekran / Monitör', description: 'Görüntüleme cihazları', costType: 'hourly', costValue: 0.5, icon: 'monitor' },
  { id: 'eq_vc', type: 'equipment', name: 'Video Konferans Cihazı', description: 'Kamera ve codec sistemleri', costType: 'hourly', costValue: 1.5, icon: 'video' },
  { id: 'eq_mic', type: 'equipment', name: 'Tavan Mikrofonu', description: 'Tavan tipi mikrofonlar', costType: 'hourly', costValue: 1.0, icon: 'mic' },
  { id: 'eq_dsp', type: 'equipment', name: 'Ses DSP / Mikser', description: 'Ses işleme üniteleri', costType: 'hourly', costValue: 2.0, icon: 'settings' },
  { id: 'eq_ctrl', type: 'equipment', name: 'Kontrol Sistemi / Dokunmatik Panel', description: 'Oda kontrol sistemleri', costType: 'hourly', costValue: 2.5, icon: 'box' },
  { id: 'eq_other', type: 'equipment', name: 'Diğer Ekipmanlar', description: 'Diğer AV ekipmanları', costType: 'hourly', costValue: 1.0, icon: 'speaker' },
  
  { id: 'srv_1', type: 'service', name: 'Söküm ve Yeniden Kurulum', description: '', costType: 'free', costValue: 0, icon: 'tool' },
  { id: 'srv_2', type: 'service', name: 'Montaj ve Devreye Alma', description: '', costType: 'free', costValue: 0, icon: 'tool' },
  { id: 'srv_3', type: 'service', name: 'Firmware ve Yazılım Güncelleme', description: '', costType: 'free', costValue: 0, icon: 'tool' },
  { id: 'srv_4', type: 'service', name: 'Sistem Taşıma (Relokasyon)', description: '', costType: 'free', costValue: 0, icon: 'tool' },
  { id: 'srv_5', type: 'service', name: 'Kablo Düzenleme ve Etiketleme', description: '', costType: 'free', costValue: 0, icon: 'tool' },
  { id: 'srv_6', type: 'service', name: 'Kullanıcı ve Yönetici Eğitimi', description: '', costType: 'free', costValue: 0, icon: 'tool' },
  { id: 'srv_7', type: 'service', name: 'Uzaktan Telefon ve E-posta Desteği', description: '', costType: 'free', costValue: 0, icon: 'tool' },
  { id: 'srv_8', type: 'service', name: 'Öncelikli SLA (Yanıt Süresi Garantisi)', description: '', costType: 'free', costValue: 0, icon: 'tool' },
  { id: 'srv_9', type: 'service', name: 'Yedek Cihaz Temini (Konsinye)', description: '', costType: 'free', costValue: 0, icon: 'tool' },
  { id: 'srv_10', type: 'service', name: 'Yerinde Arıza Tespiti', description: '', costType: 'free', costValue: 0, icon: 'tool' },
  { id: 'srv_11', type: 'service', name: 'Periyodik Sistem Raporlaması', description: '', costType: 'free', costValue: 0, icon: 'tool' },
  { id: 'srv_12', type: 'service', name: 'VIP Toplantı Desteği', description: '', costType: 'free', costValue: 0, icon: 'tool' },
];


export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  basePreventativeVisitHours: 2.0,
  remoteSupportBaseHours: 10,
  remoteSupportHoursPerRoom: 2,
  scaleDiscountThreshold: 5,
  scaleDiscountRatePerRoom: 2,
  scaleMaxDiscount: 20,
  markupPercentage: 40,
  adhocCalculationMethod: 'markup',
  adhocMarkupPercentage: 100,
  fixedPerCallPrice: 500,
  catalog: DEFAULT_CATALOG,
  servicePackages: [
    { 
      id: '5_visits', 
      label: '5 Ziyaretli Paket', 
      incidentVisits: 5,
      proactiveVisits: 4,
      desc: 'Yılda 5 arıza müdahalesi, 4 önleyici bakım ve uzaktan destek.', 
      maxRooms: 10,
    },
    { 
      id: '10_visits', 
      label: '10 Ziyaretli Paket', 
      incidentVisits: 10,
      proactiveVisits: 6,
      desc: 'Yılda 10 arıza müdahalesi, 6 önleyici bakım ve uzaktan destek.', 
      maxRooms: 30,
    },
    { 
      id: '20_visits', 
      label: '20 Ziyaretli Paket', 
      incidentVisits: 20,
      proactiveVisits: 12,
      desc: 'Yılda 20 arıza müdahalesi, 12 önleyici bakım ve uzaktan destek.',
    },
  ],
  globalIncludedServices: [
    'Uzaktan Telefon ve E-posta Desteği',
    'Firmware ve Yazılım Güncelleme',
    'Yerinde Arıza Tespiti ve Teşhis',
    'Ekipman Temizliği',
    'Detaylı Envanter Çalışması (Seri Numara, Firmware Ver., Garanti Tarihleri)',
    'Garantisi devam eden ürünlerin üreticiye gönderimi ve takibi',
  ],
  globalExcludedServices: [
    'Kablolama, altyapı tadilatları veya kanal işleri',
    'Ekipman taşıma ve fiziksel modifikasyonlar (Relokasyon)',
    'Elektrik, ağ veya IP atamaları ile ilgili müşteri tarafındaki sorunlar',
    'Arıza dışında ekipman söküm ve montaj işleri',
  ],
};

export const DEFAULT_CONFIG_STATE: ConfigState = {
  clientName: '',
  projectName: '',
  locations: [],
  servicePackage: '5_visits',
  selectedAddons: [],
  incidentVisitsPerYear: 5,
  proactiveVisitsPerYear: 4,
  billingCycle: 'Yıllık',
  selectedServiceType: 'AV Yıllık Bakım Hizmeti',
  contractStartDate: new Date().toISOString().split('T')[0],
  contractDurationMonths: 12,
  customConditions: '',
};

export const LOCATIONS = ['İstanbul', 'Ankara', 'İzmir', 'Diğer'] as const;
export const BILLING_CYCLES = ['Yıllık', 'Üç Aylık', 'Aylık'] as const;
export const SERVICE_TYPES = [
  'AV Yıllık Bakım Hizmeti',
  'AV Kurulum',
  'Zebra Yıllık Bakım',
  'Zebra Kurulum',
  'IT Kurulum',
  'IT Yıllık Bakım'
] as const;
