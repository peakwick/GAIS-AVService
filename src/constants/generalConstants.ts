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
  defaultCustomConditions: '- Çalışma saatleri hafta içi 09:00 - 18:00 arasındadır.\n- Sözleşmede tanımlanan ziyaret sayısı veya çalışma saatleri dışındaki talepler, o günkü "Adam/Saat" bedeli üzerinden ayrıca ücretlendirilir.\n- Sözleşme bedeli Türk Lirası (TL) olarak belirlenmiştir ve sözleşme süresi boyunca sabittir.\n- Sözleşme kapsamına yedek parça ve sarf malzemeleri dahil değildir.\n- Sözleşme, imza tarihinden itibaren 1 (bir) yıl süreyle geçerlidir. Sözleşme süresi sonunda herhangi bir bildirim gerekmeksizin kendiliğinden sona erer. Taraflar, yeni dönem için karşılıklı mutabakatla yeni bir sözleşme akdedebilirler.\n- Donanım arızası tespit edildiğinde, onarım işlemi (eğer mümkünse) cihazın kendi garantisi veya Müşteri tarafından ayrıca satın alınan üretici servis paketleri (Örn: Zebra OneCare) üzerinden yürütülür. Ricoh, bu süreçte sadece arıza tespiti ve lojistik koordinasyon desteği verir.',
};
