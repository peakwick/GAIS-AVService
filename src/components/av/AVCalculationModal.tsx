import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calculator, Clock, MapPin, Percent, Info, ArrowRight, Settings2 } from 'lucide-react';
import { AdminSettings, ConfigState, GeneralSettings } from '../../types';
import { calculateCosts } from '../../utils/avCalculations';
import { PriceDisplay } from '../PriceDisplay';

interface AVCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConfigState;
  admin: AdminSettings;
  general: GeneralSettings;
  onGeneralChange?: (settings: GeneralSettings) => void;
}

export function AVCalculationModal({ isOpen, onClose, config, admin, general, onGeneralChange }: AVCalculationModalProps) {
  const costs = calculateCosts(config, admin, general);
  const roomCount = config.locations.reduce((sum, loc) => sum + loc.rooms.length, 0);
  
  const dailyRate = (general.techMonthlySalary + general.techMonthlyOverhead) / general.workingDaysPerMonth;
  const hourlyRate = dailyRate / 8;
  const markupMultiplier = 1 + admin.markupPercentage / 100;
  
  // Calculate average location multiplier for display
  let totalRooms = 0;
  let weightedMultiplierSum = 0;
  config.locations.forEach(loc => {
    const rCount = loc.rooms.length;
    totalRooms += rCount;
    weightedMultiplierSum += (general.locationMultiplier[loc.city] || 1.0) * rCount;
  });
  const avgLocMultiplier = totalRooms > 0 ? weightedMultiplierSum / totalRooms : 1.0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Hesaplama Detayları</h2>
                <p className="text-sm text-gray-500">Fiyatlandırma matematiği ve varsayımlar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* 1. Labor Rate */}
            <section>
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                1. İşçilik Maliyeti Hesaplaması
              </h3>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aylık Toplam Maliyet (Maaş + Giderler):</span>
                  <span className="font-mono font-medium">₺{(general.techMonthlySalary + general.techMonthlyOverhead).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Günlük Maliyet ({general.workingDaysPerMonth} iş günü):</span>
                  <span className="font-mono font-medium">₺{dailyRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-900 font-semibold">Baz Saatlik Ücret (8 saat/gün):</span>
                  <span className="text-indigo-700 font-bold">₺{hourlyRate.toFixed(2)} / saat</span>
                </div>
              </div>
            </section>

            {/* 2. Time Estimates */}
            <section>
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                2. Zaman Tahminleri (Yıllık)
              </h3>
              <div className="space-y-4">
                {/* Equipment Hours */}
                <div className="border-l-4 border-indigo-200 pl-4 py-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Cihaz Bakım Süresi: {costs.breakdown.equipmentHours.toFixed(1)} sa</p>
                    {(costs.breakdown.scaleDiscountHours || 0) > 0 && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center">
                        <Percent className="w-3 h-3 mr-1" />
                        Ölçek Ekonomisi: -{costs.breakdown.scaleDiscountHours?.toFixed(1)} sa
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Her cihaz tipi için belirlenen sürelerin toplamı.
                    {(costs.breakdown.scaleDiscountHours || 0) > 0 && " (Aynı lokasyondaki yüksek oda verimliliğinden dolayı indirim uygulanmıştır.)"}
                  </p>
                </div>

                {/* Visit Hours */}
                <div className="border-l-4 border-indigo-200 pl-4 py-1">
                  <p className="text-sm font-semibold text-gray-900">Ziyaret Süresi: {costs.breakdown.visitHours.toFixed(1)} sa</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Toplam {(config.incidentVisitsPerYear || 0) + (config.proactiveVisitsPerYear || 0)} ziyaret. 
                    Her ziyaret için {admin.basePreventativeVisitHours} sa (yol/hazırlık) + cihaz bakım süresinin %20'si (kontrol süresi).
                  </p>
                </div>

                {/* Proactive Hours */}
                <div className="border-l-4 border-indigo-200 pl-4 py-1">
                  <p className="text-sm font-semibold text-gray-900">Uzaktan Destek: {costs.breakdown.proactiveHours.toFixed(1)} sa</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Temel {admin.remoteSupportBaseHours} sa + oda başı {admin.remoteSupportHoursPerRoom} sa + cihaz bakım süresinin %5'i (izleme).
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Multipliers */}
            <section>
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center">
                <Percent className="w-4 h-4 mr-2" />
                3. Çarpanlar ve Lojistik
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Ortalama Konum Çarpanı</p>
                  <p className="text-lg font-semibold text-gray-900">x{avgLocMultiplier.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Kar Marjı</p>
                  <p className="text-lg font-semibold text-gray-900">%{admin.markupPercentage} (x{markupMultiplier.toFixed(2)})</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 md:col-span-2">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Lojistik (Ziyaret Başına)</p>
                  <p className="text-sm text-gray-900">
                    Yakıt: ₺{general.fuelCostPerVisit} + Otopark: ₺{general.parkingCostPerVisit} = ₺{general.fuelCostPerVisit + general.parkingCostPerVisit}
                  </p>
                </div>
              </div>
            </section>

            {/* 3.5 Add-ons (Ek Hizmetler) */}
            {costs.breakdown.addonCost > 0 && (
              <section>
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center">
                  <Settings2 className="w-4 h-4 mr-2" />
                  3.5 Ek Hizmetler (Add-ons)
                </h3>
                <div className="space-y-3">
                  {costs.breakdown.addonDetails.map((addon) => (
                    <div key={addon.id} className="border-l-4 border-indigo-400 pl-4 py-1 bg-indigo-50/30 rounded-r-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">
                          {addon.name} {addon.quantity > 1 && <span className="text-indigo-600 ml-1">x{addon.quantity}</span>}
                        </p>
                        <span className="text-sm font-bold text-indigo-700">
                          <PriceDisplay amount={addon.price} adminSettings={admin} generalSettings={general} onGeneralChange={onGeneralChange} />
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Maliyet: <PriceDisplay amount={addon.cost} adminSettings={admin} generalSettings={general} onGeneralChange={onGeneralChange} /> + %{admin.markupPercentage} Kar Marjı
                      </p>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between items-center text-sm font-bold text-indigo-900 px-1">
                    <span>Toplam Ek Hizmet Bedeli:</span>
                    <span><PriceDisplay amount={costs.breakdown.addonCost} adminSettings={admin} generalSettings={general} onGeneralChange={onGeneralChange} /></span>
                  </div>
                </div>
              </section>
            )}

            {/* 4. Final Math */}
            <section className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 opacity-80">4. Nihai Hesaplama</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Toplam İşçilik + Yol (Saat x Ücret x Konum):</span>
                  <span className="font-mono">₺{(costs.totalAnnualHours * hourlyRate * avgLocMultiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Toplam Lojistik (Yakıt / Otopark):</span>
                  <span className="font-mono">₺{costs.breakdown.totalLogisticsCost.toLocaleString()}</span>
                </div>
                {(costs.breakdown.fixedEquipmentCost > 0 || costs.breakdown.fixedServiceCost > 0) && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Sabit Cihaz/Hizmet Maliyetleri:</span>
                    <span className="font-mono">₺{(costs.breakdown.fixedEquipmentCost + costs.breakdown.fixedServiceCost).toLocaleString()}</span>
                  </div>
                )}
                {costs.breakdown.addonCost > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Ek Hizmetler (Add-ons) Maliyeti:</span>
                    <span className="font-mono">₺{(costs.breakdown.addonCost / markupMultiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                  <span className="font-semibold">Toplam Yıllık Maliyet (Ham):</span>
                  <span className="font-mono text-xl">₺{costs.annualBaseCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Nihai Fiyat (Maliyet x Kar Marjı):</span>
                  <div className="text-right">
                    <PriceDisplay amount={costs.annualPrice} adminSettings={admin} generalSettings={general} onGeneralChange={onGeneralChange} />
                    <p className="text-[10px] opacity-60 font-normal mt-0.5">Yıllık Toplam</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 italic">
              * Bu hesaplamalar girilen parametrelere dayalı tahmini değerlerdir.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
