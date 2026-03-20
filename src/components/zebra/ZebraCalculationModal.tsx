import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calculator, Clock, MapPin, Percent, Info, ArrowRight, Settings2 } from 'lucide-react';
import { AdminSettings, ConfigState, GeneralSettings } from '../../types';
import { calculateCosts } from '../../utils/zebraCalculations';
import { PriceDisplay } from '../PriceDisplay';

interface ZebraCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConfigState;
  admin: AdminSettings;
  general: GeneralSettings;
  onGeneralChange?: (settings: GeneralSettings) => void;
}

export function ZebraCalculationModal({ isOpen, onClose, config, admin, general, onGeneralChange }: ZebraCalculationModalProps) {
  const costs = calculateCosts(config, admin, general);
  const totalDevices = config.locations.reduce((acc, loc) => acc + (loc.equipment || []).reduce((sum, e) => sum + e.quantity, 0), 0);
  
  const dailyRate = (general.techMonthlySalary + general.techMonthlyOverhead) / general.workingDaysPerMonth;
  const hourlyRate = dailyRate / 8;
  const markupMultiplier = 1 + admin.markupPercentage / 100;
  
  // Calculate average location multiplier for display
  let totalDevs = 0;
  let weightedMultiplierSum = 0;
  config.locations.forEach(loc => {
    const devCount = (loc.equipment || []).reduce((s, e) => s + e.quantity, 0);
    totalDevs += devCount;
    weightedMultiplierSum += (general.locationMultiplier[loc.city] || 1.0) * devCount;
  });
  const avgLocMultiplier = totalDevs > 0 ? weightedMultiplierSum / totalDevs : 1.0;

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
                <h2 className="text-xl font-bold text-gray-900">Zebra Hesaplama Detayları</h2>
                <p className="text-sm text-gray-500">Donanım bakım matematiği ve varsayımlar</p>
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
                  <span className="text-gray-600">Teknisyen Aylık Maliyeti:</span>
                  <span className="font-mono font-medium">₺{(general.techMonthlySalary + general.techMonthlyOverhead).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-900 font-semibold">Baz Saatlik Ücret:</span>
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
                  <p className="text-xs text-gray-500 mt-1">Cihaz başına atanan bakım sürelerinin toplamı.</p>
                </div>

                <div className="border-l-4 border-indigo-200 pl-4 py-1">
                  <p className="text-sm font-semibold text-gray-900">Ziyaret Süresi: {costs.breakdown.visitHours.toFixed(1)} sa</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Toplam {(config.incidentVisitsPerYear || 0) + (config.proactiveVisitsPerYear || 0)} ziyaret. 
                    Baz: {admin.basePreventativeVisitHours} sa + Cihaz süresinin %10'u.
                  </p>
                </div>

                <div className="border-l-4 border-indigo-200 pl-4 py-1">
                  <p className="text-sm font-semibold text-gray-900">Uzaktan Destek & İzleme: {costs.breakdown.proactiveHours.toFixed(1)} sa</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Baz {admin.remoteSupportBaseHours} sa + Cihaz başı {(admin.remoteSupportHoursPerRoom || 0.05)} sa + Cihaz süresinin %5'i.
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
                  <p className="text-lg font-semibold text-gray-900">%{admin.markupPercentage}</p>
                </div>
              </div>
            </section>

            {/* 4. Final Math */}
            <section className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 opacity-80">4. Nihai Hesaplama</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Toplam İşçilik (Saat x Ücret x Konum):</span>
                  <span className="font-mono">₺{(costs.totalAnnualHours * hourlyRate * avgLocMultiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Toplam Lojistik (Yakıt / Otopark):</span>
                  <span className="font-mono">₺{costs.breakdown.totalLogisticsCost.toLocaleString()}</span>
                </div>
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
              * Zebra bakım hesaplamaları cihaz adetlerine ve lokasyon çarpanlarına dayalıdır.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
