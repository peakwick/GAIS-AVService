import React from 'react';
import { ConfigState, AdminSettings, ServicePackage, GeneralSettings } from '../../types';
import { BILLING_CYCLES } from '../../constants/zebraConstants';
import { calculatePackageCost, calculateCosts } from '../../utils/zebraCalculations';
import { Package, CheckCircle2, AlertCircle, Settings2, Check, X, Circle, AlertTriangle, Calculator } from 'lucide-react';
import { PriceDisplay } from '../PriceDisplay';

interface ZebraServicePackagesProps {
  config: ConfigState;
  adminSettings: AdminSettings;
  generalSettings: GeneralSettings;
  onChange: (config: ConfigState) => void;
  onAdminChange?: (settings: AdminSettings) => void;
  onGeneralChange?: (settings: GeneralSettings) => void;
  onShowBreakdown?: (config: ConfigState) => void;
}

export function ZebraServicePackages({ config, adminSettings, generalSettings, onChange, onAdminChange, onGeneralChange, onShowBreakdown }: ZebraServicePackagesProps) {
  const updateField = (field: keyof ConfigState, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const currentCosts = calculateCosts(config, adminSettings, generalSettings);
  const packages = adminSettings.servicePackages || [];

  // Calculate equipment aggregates for summary
  const equipmentAggregates = config.locations.reduce((acc, loc) => {
    (loc.equipment || []).forEach(eq => {
      const item = adminSettings.catalog?.find(c => c.id === eq.catalogId);
      if (item) {
        acc[item.name] = (acc[item.name] || 0) + eq.quantity;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const hasEquipment = Object.keys(equipmentAggregates).length > 0;

  const handleShowBreakdown = (e: React.MouseEvent, pkgId: string) => {
    e.stopPropagation();
    if (onShowBreakdown) {
      const packages = adminSettings.servicePackages || [];
      const pkg = packages.find(p => p.id === pkgId);
      if (pkg) {
        const tempConfig = { 
          ...config, 
          servicePackage: pkgId,
          incidentVisitsPerYear: pkg.incidentVisits,
          proactiveVisitsPerYear: pkg.proactiveVisits
        };
        onShowBreakdown(tempConfig);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Zebra Servis Paketleri</h2>
          <p className="text-gray-500 mt-1">Cihazlarınız için en uygun bakım seviyesini seçin.</p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-900">
            Yıllık Toplam: <PriceDisplay amount={currentCosts.annualPrice} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const pkgCosts = calculatePackageCost(config, adminSettings, pkg.id, generalSettings);
          const isSelected = config.servicePackage === pkg.id;

          return (
            <div
              key={pkg.id}
              onClick={() => {
                onChange({
                  ...config,
                  servicePackage: pkg.id,
                  incidentVisitsPerYear: pkg.incidentVisits,
                  proactiveVisitsPerYear: pkg.proactiveVisits
                });
              }}
              className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/30'
                  : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Package className="w-6 h-6" />
                </div>
                {isSelected && (
                  <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full">Seçili</span>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900">{pkg.label}</h3>
              <p className="text-sm text-gray-500 mt-2 mb-6 min-h-[40px]">{pkg.desc}</p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
                  <span className="text-gray-700">{pkg.incidentVisits} Arıza Müdahalesi / Yıl</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
                  <span className="text-gray-700">{pkg.proactiveVisits} Önleyici Bakım / Yıl</span>
                </div>
              </div>

              {/* Inclusions and Exclusions */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-100 flex-grow">
                {hasEquipment && (
                  <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100/50">
                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center">
                      <Settings2 className="w-3 h-3 mr-1" />
                      Cihaz Envanter Özeti
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(equipmentAggregates).map(([name, qty]) => (
                        <div key={name} className="bg-white px-2 py-1 rounded-md border border-gray-100 text-[10px] font-medium text-gray-600 shadow-sm">
                          <span className="text-indigo-600 font-bold mr-1">{qty}</span>
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Dahil Olan Hizmetler</h4>
                  <div className="space-y-2">
                    {(adminSettings.globalIncludedServices || []).map((f, i) => (
                      <div key={`std-${i}`} className="flex items-start space-x-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600">{f}</span>
                      </div>
                    ))}
                    {(config.selectedAddons || []).map((addon, i) => {
                      const catalogItem = adminSettings.catalog?.find(item => item.id === addon.id);
                      if (!catalogItem) return null;
                      return (
                        <div key={`addon-${i}`} className="flex items-start space-x-2 text-xs">
                          <Check className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                          <span className="text-gray-700 font-medium">
                            {catalogItem.name} {addon.quantity > 1 && `x${addon.quantity}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {(adminSettings.globalExcludedServices || []).length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kapsam Dışı</h4>
                    <div className="space-y-2">
                      {(adminSettings.globalExcludedServices || []).map((item, i) => (
                        <div key={`excl-${i}`} className="flex items-start space-x-2 text-xs">
                          <X className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                          <span className="text-gray-400">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100 flex-grow">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Yıllık Yatırım</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-gray-900">
                    <PriceDisplay amount={pkgCosts.annualPrice} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} />
                  </span>
                  <span className="text-sm text-gray-500 font-medium">/ yıl</span>
                </div>

                {(pkgCosts.adhocAnnualPrice || 0) > pkgCosts.annualPrice && (
                  <div className="mt-4 bg-green-50/60 border border-green-100 rounded-lg p-3 text-xs">
                    <div className="flex justify-between items-center text-gray-500 mb-1.5">
                      <span>Per-Call Anlaşmasız Fiyat:</span>
                      <span className="line-through"><PriceDisplay amount={pkgCosts.adhocAnnualPrice} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
                    </div>
                    <div className="flex justify-between items-center text-green-700 font-bold mb-2 pb-2 border-b border-green-200/50">
                      <span>Bu Paketle Kazancınız:</span>
                       <span><PriceDisplay amount={pkgCosts.adhocAnnualPrice - pkgCosts.annualPrice} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
                    </div>
                    <p className="text-[10px] text-green-800/80 leading-snug">
                      * Per-Call hizmetler anlık olarak sadece arızalı cihaza müdahaleyi kapsar. Bu bakım paketi ise <strong>tüm ekipman envanterinizi</strong> ve yukarıdaki <strong>ek hizmetleri</strong> garanti altına alır.
                    </p>
                  </div>
                )}

                {/* Price Breakdown */}
                <div 
                  className="mt-4 space-y-1.5 text-xs border-t border-gray-100 pt-3 group/breakdown hover:bg-gray-50/50 rounded-lg transition-colors cursor-help"
                  onClick={(e) => handleShowBreakdown(e, pkg.id)}
                  title="Hesaplama detaylarını görmek için tıklayın"
                >
                  <div className="flex justify-between text-gray-600">
                    <span>Cihaz İşçiliği ({pkgCosts.breakdown.equipmentHours.toFixed(1)}s):</span>
                    <span className="font-medium"><PriceDisplay amount={pkgCosts.breakdown.equipmentCost} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ziyaret / Yol ({pkgCosts.breakdown.visitHours.toFixed(1)}s):</span>
                    <span className="font-medium"><PriceDisplay amount={pkgCosts.breakdown.visitCost} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
                  </div>
                  {pkgCosts.breakdown.proactiveHours > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Uzaktan Destek ({pkgCosts.breakdown.proactiveHours.toFixed(1)}s):</span>
                      <span className="font-medium"><PriceDisplay amount={pkgCosts.breakdown.proactiveCost} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
                    </div>
                  )}

                  {pkgCosts.breakdown.logisticsCost > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Lojistik (Yakıt/Otopark):</span>
                      <span className="font-medium"><PriceDisplay amount={pkgCosts.breakdown.logisticsCost} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
                    </div>
                  )}

                  {pkgCosts.breakdown.addonCost > 0 && (
                    <div className="flex justify-between text-indigo-600 font-semibold">
                      <span>Ek Hizmetler (Add-ons):</span>
                      <span><PriceDisplay amount={pkgCosts.breakdown.addonCost} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center pt-1 text-[10px] text-indigo-500 font-medium opacity-0 group-hover/breakdown:opacity-100 transition-opacity">
                    <Calculator className="w-3 h-3 mr-1" />
                    Hesaplama Detayları
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom Package */}
        <div
          onClick={() => updateField('servicePackage', 'custom')}
          className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 ${
            config.servicePackage === 'custom'
              ? 'border-indigo-600 bg-indigo-50/30'
              : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${config.servicePackage === 'custom' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
              <Settings2 className="w-6 h-6" />
            </div>
            {config.servicePackage === 'custom' && (
              <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full">Seçili</span>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900">Özel Yapılandırma</h3>
          <p className="text-sm text-gray-500 mt-2 mb-6 min-h-[40px]">Ziyaret adetlerini tamamen kendiniz belirleyin.</p>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Arıza Müdahale</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={config.incidentVisitsPerYear}
                  onChange={(e) => {
                    onChange({
                    ...config,
                    servicePackage: 'custom',
                    incidentVisitsPerYear: parseInt(e.target.value)
                  });
                }}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-sm font-bold text-gray-700 w-8">{config.incidentVisitsPerYear}</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Önleyici Bakım</label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="24"
                value={config.proactiveVisitsPerYear}
                onChange={(e) => {
                  onChange({
                    ...config,
                    servicePackage: 'custom',
                    proactiveVisitsPerYear: parseInt(e.target.value)
                  });
                }}
                  className="flex-1 accent-indigo-600"
                />
                <span className="text-sm font-bold text-gray-700 w-8">{config.proactiveVisitsPerYear}</span>
              </div>
            </div>
          </div>

          {/* Inclusions and Exclusions for Custom Package */}
          <div className="space-y-4 mb-6 pb-6 border-b border-gray-100 flex-grow">
            {hasEquipment && (
              <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100/50">
                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center">
                  <Settings2 className="w-3 h-3 mr-1" />
                  Cihaz Envanter Özeti
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(equipmentAggregates).map(([name, qty]) => (
                    <div key={name} className="bg-white px-2 py-1 rounded-md border border-gray-100 text-[10px] font-medium text-gray-600 shadow-sm">
                      <span className="text-indigo-600 font-bold mr-1">{qty}</span>
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Dahil Olan Hizmetler</h4>
              <div className="space-y-2">
                {(adminSettings.globalIncludedServices || []).map((f, i) => (
                  <div key={`std-custom-${i}`} className="flex items-start space-x-2 text-xs">
                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-600">{f}</span>
                  </div>
                ))}
                {(config.selectedAddons || []).map((addon, i) => {
                  const catalogItem = adminSettings.catalog?.find(item => item.id === addon.id);
                  if (!catalogItem) return null;
                  return (
                    <div key={`addon-custom-${i}`} className="flex items-start space-x-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                      <span className="text-gray-700 font-medium">
                        {catalogItem.name} {addon.quantity > 1 && `x${addon.quantity}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {(adminSettings.globalExcludedServices || []).length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kapsam Dışı</h4>
                <div className="space-y-2">
                  {(adminSettings.globalExcludedServices || []).map((item, i) => (
                    <div key={`excl-custom-${i}`} className="flex items-start space-x-2 text-xs">
                      <X className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                      <span className="text-gray-400">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 flex-grow">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Hesaplanan Yatırım</p>
            <div className="flex items-baseline justify-between mb-4">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-gray-900">
                  <PriceDisplay amount={currentCosts.annualPrice} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} />
                </span>
                <span className="text-sm text-gray-500 font-medium">/ yıl</span>
              </div>
            </div>

            {/* Price Breakdown for Custom */}
            <div 
              className="mt-4 space-y-1.5 text-xs border-t border-gray-100 pt-3 group/breakdown hover:bg-gray-50/50 rounded-lg transition-colors cursor-help"
              onClick={(e) => { e.stopPropagation(); onShowBreakdown?.(config); }}
              title="Hesaplama detaylarını görmek için tıklayın"
            >
              <div className="flex justify-between text-gray-600">
                <span>Cihaz İşçiliği ({currentCosts.breakdown.equipmentHours.toFixed(1)}s):</span>
                <span className="font-medium"><PriceDisplay amount={currentCosts.breakdown.equipmentCost} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Ziyaret / Yol ({currentCosts.breakdown.visitHours.toFixed(1)}s):</span>
                <span className="font-medium"><PriceDisplay amount={currentCosts.breakdown.visitCost} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
              </div>
              {currentCosts.breakdown.proactiveHours > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Uzaktan Destek ({currentCosts.breakdown.proactiveHours.toFixed(1)}s):</span>
                  <span className="font-medium"><PriceDisplay amount={currentCosts.breakdown.proactiveCost} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
                </div>
              )}

              {currentCosts.breakdown.logisticsCost > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Lojistik (Yakıt/Otopark):</span>
                  <span className="font-medium"><PriceDisplay amount={currentCosts.breakdown.logisticsCost} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
                </div>
              )}

              {currentCosts.breakdown.addonCost > 0 && (
                <div className="flex justify-between text-indigo-600 font-semibold">
                  <span>Ek Hizmetler (Add-ons):</span>
                  <span><PriceDisplay amount={currentCosts.breakdown.addonCost} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
                </div>
              )}
              
              <div className="flex items-center justify-center pt-1 text-[10px] text-indigo-500 font-medium opacity-0 group-hover/breakdown:opacity-100 transition-opacity">
                <Calculator className="w-3 h-3 mr-1" />
                Hesaplama Detayları
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add-on Services Section */}
      {(() => {
        const addonServices = (adminSettings.catalog || []).filter(item => item.type === 'service');
        if (addonServices.length === 0) return null;

        const hourlyRate = (generalSettings.techMonthlySalary + generalSettings.techMonthlyOverhead) / generalSettings.workingDaysPerMonth / 8;
        
        // Calculate average location multiplier for Zebra (per device)
        let totalDevs = 0;
        let weightedMultiplierSum = 0;
        config.locations.forEach(loc => {
          const devCount = (loc.equipment || []).reduce((s, e) => s + e.quantity, 0);
          totalDevs += devCount;
          weightedMultiplierSum += (generalSettings.locationMultiplier[loc.city] || 1.0) * devCount;
        });
        const avgLocMultiplier = totalDevs > 0 ? weightedMultiplierSum / totalDevs : 1.0;
        const markupMultiplier = 1 + adminSettings.markupPercentage / 100;

        const updateAddonQuantity = (id: string, qty: number) => {
          const current = config.selectedAddons || [];
          if (qty < 1) {
            onChange({ ...config, selectedAddons: current.filter(a => a.id !== id) });
            return;
          }
          onChange({ ...config, selectedAddons: current.map(a => a.id === id ? { ...a, quantity: qty } : a) });
        };

        const toggleAddon = (id: string) => {
          const current = config.selectedAddons || [];
          const existing = current.find(a => a.id === id);
          if (existing) {
            onChange({ ...config, selectedAddons: current.filter(a => a.id !== id) });
          } else {
            onChange({ ...config, selectedAddons: [...current, { id, quantity: 1 }] });
          }
        };

        return (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 line-print-hidden">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Settings2 className="w-5 h-5 mr-2 text-indigo-500" />
                Ek Hizmetler (Add-ons)
              </h3>
              <p className="text-sm text-gray-500 mt-1">Zebra cihazları için opsiyonel ek hizmetleri seçin.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addonServices.map((service) => {
                const selected = (config.selectedAddons || []).find(a => a.id === service.id);
                const isSelected = !!selected;
                
                let baseCost = 0;
                if (service.costType === 'hourly') {
                  baseCost = service.costValue * hourlyRate * avgLocMultiplier;
                } else if (service.costType === 'monthly') {
                  baseCost = service.costValue * 12;
                } else if (service.costType === 'annual') {
                  baseCost = service.costValue;
                } else if (service.costType === 'per_unit') {
                  baseCost = service.costValue * (service.unitCount || 1);
                }

                const displayPrice = baseCost * markupMultiplier;
                const adhocMarkupMultiplier = 1 + (adminSettings.adhocMarkupPercentage || 100) / 100;
                const adhocPrice = baseCost * adhocMarkupMultiplier;

                return (
                  <div
                    key={service.id}
                    className={`rounded-xl border-2 p-4 transition-all flex flex-col ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-gray-200 bg-gray-50 hover:border-indigo-200 hover:bg-white'
                    }`}
                  >
                    <div 
                      className="flex items-start space-x-3 cursor-pointer"
                      onClick={() => toggleAddon(service.id)}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold leading-tight ${isSelected ? 'text-indigo-900' : 'text-gray-800'}`}>{service.name}</p>
                        {service.description && (
                          <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex flex-col space-y-2">
                        <div>
                          <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Birim Maliyet</div>
                          <div className="text-xs text-gray-400 font-medium">
                            <PriceDisplay amount={baseCost} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} />
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Anlaşmasız Fiyat</div>
                          <div className="text-xs text-gray-400 font-medium">
                            <PriceDisplay amount={adhocPrice} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider mb-0.5">Teklif Fiyatı</div>
                        <div className="text-sm font-bold text-indigo-700">
                          <PriceDisplay amount={displayPrice} adminSettings={adminSettings} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} />
                        </div>
                      </div>
                    </div>

                    {isSelected && service.costType !== 'free' && (
                      <div className="mt-3 flex items-center justify-between bg-white rounded-lg border border-indigo-100 p-1.5">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase ml-1">Adet</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateAddonQuantity(service.id, (selected?.quantity || 1) - 1); }}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          >-</button>
                          <span className="text-sm font-bold text-indigo-900 w-6 text-center">{selected?.quantity || 1}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateAddonQuantity(service.id, (selected?.quantity || 1) + 1); }}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          >+</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Detail Breakdown Helper */}
      <div 
        className="bg-indigo-900 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between cursor-pointer hover:bg-black transition-colors"
        onClick={() => onShowBreakdown?.(config)}
      >
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-800 p-3 rounded-xl border border-indigo-700">
            <Calculator className="w-8 h-8 text-indigo-300" />
          </div>
          <div>
            <h4 className="text-lg font-bold">Hesaplama Detaylarını İnceleyin</h4>
            <p className="text-indigo-200 text-sm">İşçilik, lojistik ve kâr marjı dağılımını görün.</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 px-6 py-2 bg-white/10 rounded-full border border-white/20 font-medium text-sm hover:bg-white/20 transition-colors">
          Analiz Et
        </div>
      </div>
    </div>
  );
}
