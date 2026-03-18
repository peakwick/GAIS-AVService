import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calculator, Clock, MapPin, Percent, Info, ArrowRight } from 'lucide-react';
import { AdminSettings, ConfigState } from '../types';
import { calculateCosts } from '../utils/calculations';
import { PriceDisplay } from './PriceDisplay';

interface CalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConfigState;
  admin: AdminSettings;
}

export function CalculationModal({ isOpen, onClose, config, admin }: CalculationModalProps) {
  const costs = calculateCosts(config, admin);
  const roomCount = config.locations.reduce((sum, loc) => sum + loc.rooms.length, 0);
  
  const dailyRate = (admin.techMonthlySalary + admin.techMonthlyOverhead) / admin.workingDaysPerMonth;
  const hourlyRate = dailyRate / 8;
  const markupMultiplier = 1 + admin.markupPercentage / 100;
  
  // Calculate average location multiplier for display
  let totalRooms = 0;
  let weightedMultiplierSum = 0;
  config.locations.forEach(loc => {
    const rCount = loc.rooms.length;
    totalRooms += rCount;
    weightedMultiplierSum += (admin.locationMultiplier[loc.city] || 1.0) * rCount;
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
                  <span className="font-mono font-medium">₺{(admin.techMonthlySalary + admin.techMonthlyOverhead).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Günlük Maliyet ({admin.workingDaysPerMonth} iş günü):</span>
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
                  <p className="text-sm font-semibold text-gray-900">Cihaz Bakım Süresi: {costs.breakdown.equipmentHours.toFixed(1)} sa</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Her cihaz tipi için belirlenen sürelerin toplamı.
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
                    Yakıt: ₺{admin.fuelCostPerVisit} + Otopark: ₺{admin.parkingCostPerVisit} = ₺{admin.fuelCostPerVisit + admin.parkingCostPerVisit}
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Final Math */}
            <section className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 opacity-80">4. Nihai Hesaplama</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Toplam Yıllık Saat x Saatlik Ücret x Konum:</span>
                  <span className="font-mono">({costs.totalAnnualHours.toFixed(1)} x ₺{hourlyRate.toFixed(0)} x {avgLocMultiplier.toFixed(2)})</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Toplam Lojistik Maliyeti:</span>
                  <span className="font-mono">₺{costs.breakdown.totalLogisticsCost.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                  <span className="font-semibold">Toplam Yıllık Maliyet:</span>
                  <span className="font-mono">₺{costs.annualBaseCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Nihai Fiyat (Maliyet x Kar Marjı):</span>
                  <div className="text-right">
                    <PriceDisplay amount={costs.annualPrice} adminSettings={admin} />
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
