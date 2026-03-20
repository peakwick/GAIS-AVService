import React from 'react';
import { GeneralSettings, Location, BillingCycle } from '../types';
import { LOCATIONS, BILLING_CYCLES } from '../constants/avConstants';
import { Users, Clock, MapPin, Percent, Globe } from 'lucide-react';

interface GeneralAdminPanelProps {
  settings: GeneralSettings;
  onChange: (settings: GeneralSettings) => void;
}

export function GeneralAdminPanel({ settings, onChange }: GeneralAdminPanelProps) {
  const handleChange = (field: keyof GeneralSettings, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  const handleNestedChange = (parent: 'locationMultiplier' | 'billingCycleMultiplier', key: string, value: number) => {
    onChange({
      ...settings,
      [parent]: {
        ...settings[parent],
        [key]: value
      }
    });
  };

  const dailyRate = (settings.techMonthlySalary + settings.techMonthlyOverhead) / settings.workingDaysPerMonth;
  const hourlyRate = dailyRate / 8;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Genel Sistem Ayarları</h2>
        <p className="text-gray-500 mt-1">Tüm modüller için ortak olan personel maliyetlerini, döviz kurlarını ve lojistik çarpanlarını buradan yönetin.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Personnel Costs */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-500" />
            Personel Giderleri
          </h3>
          <p className="text-sm text-gray-500 mb-6">Teknik ekibin saatlik maliyetini hesaplamak için aylık giderleri girin.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aylık Maaş / Uzman</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₺</span>
                <input
                  type="number"
                  value={settings.techMonthlySalary || 0}
                  onChange={(e) => handleChange('techMonthlySalary', Number(e.target.value))}
                  className="pl-8 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aylık Yan Haklar vb.</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₺</span>
                <input
                  type="number"
                  value={settings.techMonthlyOverhead || 0}
                  onChange={(e) => handleChange('techMonthlyOverhead', Number(e.target.value))}
                  className="pl-8 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Çalışılan Gün / Ay</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.workingDaysPerMonth || 22}
                  onChange={(e) => handleChange('workingDaysPerMonth', Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">Gün</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-center">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm transition-all hover:bg-white hover:border-indigo-100">
              <span className="block text-gray-500 mb-1 text-[10px] uppercase tracking-wider font-bold">Saatlik Maliyet</span>
              <span className="font-bold text-indigo-700 text-lg">₺{hourlyRate.toFixed(2)}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm transition-all hover:bg-white hover:border-indigo-100">
              <span className="block text-gray-500 mb-1 text-[10px] uppercase tracking-wider font-bold">Yarım Gün (4 sa)</span>
              <span className="font-bold text-indigo-700 text-lg">₺{(hourlyRate * 4).toFixed(2)}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm transition-all hover:bg-white hover:border-indigo-100">
              <span className="block text-gray-500 mb-1 text-[10px] uppercase tracking-wider font-bold">Tam Gün (8 sa)</span>
              <span className="font-bold text-indigo-700 text-lg">₺{(hourlyRate * 8).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-indigo-500" />
            Döviz Kuru
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dolar Kuru (USD/TRY)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₺</span>
                <input
                  type="number"
                  step="0.01"
                  value={settings.usdExchangeRate || 0}
                  onChange={(e) => handleChange('usdExchangeRate', Number(e.target.value))}
                  className="pl-8 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logistics */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
            Saha Ziyareti Lojistik Maliyetleri
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ortalama Yakıt Maliyeti (Ziyaret Başına)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₺</span>
                <input
                  type="number"
                  value={settings.fuelCostPerVisit || 0}
                  onChange={(e) => handleChange('fuelCostPerVisit', Number(e.target.value))}
                  className="pl-8 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ortalama Otopark/Yol Maliyeti (Ziyaret Başına)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₺</span>
                <input
                  type="number"
                  value={settings.parkingCostPerVisit || 0}
                  onChange={(e) => handleChange('parkingCostPerVisit', Number(e.target.value))}
                  className="pl-8 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location Multipliers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
            Konum Çarpanları
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {LOCATIONS.map(loc => (
              <div key={loc}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{loc}</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.locationMultiplier[loc]}
                  onChange={(e) => handleNestedChange('locationMultiplier', loc, Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Billing Cycle Multipliers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-500" />
            Ödeme Planı Çarpanları
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {BILLING_CYCLES.map(cycle => (
              <div key={cycle}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{cycle}</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.billingCycleMultiplier[cycle]}
                  onChange={(e) => handleNestedChange('billingCycleMultiplier', cycle, Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
