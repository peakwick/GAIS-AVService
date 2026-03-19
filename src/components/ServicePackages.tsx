import React from 'react';
import { ConfigState, AdminSettings, ServicePackage } from '../types';
import { BILLING_CYCLES } from '../constants';
import { calculatePackageCost } from '../utils/calculations';
import { Package, CheckCircle2, AlertCircle, Settings2, Check, X, Circle, AlertTriangle, Calculator } from 'lucide-react';
import { PriceDisplay } from './PriceDisplay';

interface ServicePackagesProps {
  config: ConfigState;
  adminSettings: AdminSettings;
  onChange: (config: ConfigState) => void;
  onAdminChange?: (settings: AdminSettings) => void;
  onShowBreakdown?: (config: ConfigState) => void;
}

export function ServicePackages({ config, adminSettings, onChange, onAdminChange, onShowBreakdown }: ServicePackagesProps) {
  const updateField = (field: keyof ConfigState, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const selectPackage = (pkgId: ServicePackage) => {
    const packages = adminSettings.servicePackages || [];
    const data = packages.find(p => p.id === pkgId);
    if (data) {
      onChange({
        ...config,
        servicePackage: pkgId,
        incidentVisitsPerYear: data.incidentVisits,
        proactiveVisitsPerYear: data.proactiveVisits
      });
    }
  };

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
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Hizmet Paketleri</h2>
        <p className="text-gray-500 mt-1">Projenizin ölçeğine ve envanterinize uygun bakım ve destek paketini seçin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {(adminSettings.servicePackages || []).map((pkg) => {
          const costs = calculatePackageCost(config, adminSettings, pkg.id);
          const isSelected = config.servicePackage === pkg.id;
          
          // Warning logic based on room count
          const roomCount = config.locations.reduce((sum, loc) => sum + loc.rooms.length, 0);
          let warning = null;
          if (pkg.maxRooms && roomCount > pkg.maxRooms) {
            warning = `Bu paket mevcut oda sayınız (${pkg.maxRooms}+) için yetersiz kalabilir.`;
          }

          return (
            <div 
              key={pkg.id}
              onClick={() => selectPackage(pkg.id)}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col ${
                isSelected 
                  ? 'bg-indigo-50 border-indigo-600 shadow-md' 
                  : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className={`text-lg font-bold ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                  {pkg.label}
                </h3>
                {isSelected ? (
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300 shrink-0" />
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4 flex-grow">{pkg.desc}</p>

              <div className="flex items-center justify-between text-sm mb-4 bg-white/50 rounded-lg p-2 border border-gray-100">
                <div className="text-center px-2">
                  <span className="block text-lg font-bold text-gray-900">{roomCount}</span>
                  <span className="text-xs text-gray-500">Oda<br/>Sayısı</span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center px-2">
                  <span className="block text-lg font-bold text-gray-900">{pkg.incidentVisits || 0}</span>
                  <span className="text-xs text-gray-500">Arıza<br/>Müdahale</span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center px-2">
                  <span className="block text-lg font-bold text-gray-900">{pkg.proactiveVisits || 0}</span>
                  <span className="text-xs text-gray-500">Önleyici<br/>Bakım</span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center px-2">
                  <span className="block text-lg font-bold text-indigo-600">{(pkg.incidentVisits || 0) + (pkg.proactiveVisits || 0)}</span>
                  <span className="text-xs text-indigo-500/80">Toplam<br/>Ziyaret</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Ekipman Bakım Kapsamı</h4>
                <div className="space-y-3">
                  {Object.entries(
                    config.locations.reduce((acc, loc) => {
                      loc.rooms.forEach(room => {
                        room.equipment.forEach(eq => {
                          acc[eq.catalogId] = (acc[eq.catalogId] || 0) + eq.quantity;
                        });
                      });
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([catalogId, count]) => {
                    const item = adminSettings.catalog?.find(c => c.id === catalogId);
                    if (!item) return null;
                    return (
                      <div key={catalogId} className="flex items-start space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                        <div className="text-gray-700">
                          <span className="font-medium">{count} Adet {item.name.split(' / ')[0]}</span>
                          {item.description && (
                            <span className="block text-xs text-gray-500 mt-0.5">{item.description}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Standard features always included in any package */}
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Her Pakette Dahil Olan</h4>
                {(adminSettings.globalIncludedServices || []).map((f, i) => (
                  <div key={i} className="flex items-start space-x-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{f}</span>
                  </div>
                ))}
              </div>

              {/* Global excluded services */}
              {(adminSettings.globalExcludedServices || []).length > 0 && (
                <div className="space-y-2 mb-6 pb-4 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Kapsam Dışı (Tüm Paketler)</h4>
                  {(adminSettings.globalExcludedServices || []).map((item, i) => (
                    <div key={i} className="flex items-start space-x-2 text-sm">
                      <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <span className="text-gray-400">{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {warning && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>{warning}</span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200/60 mt-auto">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Tahmini Yıllık Fiyat</p>
                <p className={`text-2xl font-bold ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                  <PriceDisplay amount={costs.annualPrice} adminSettings={adminSettings} onAdminChange={onAdminChange} />
                </p>

                {(costs.adhocAnnualPrice || 0) > costs.annualPrice && (
                  <div className="mt-4 bg-green-50/60 border border-green-100 rounded-lg p-3 text-xs">
                    <div className="flex justify-between items-center text-gray-500 mb-1.5">
                      <span>Per-Call Anlaşmasız Fiyat:</span>
                      <span className="line-through"><PriceDisplay amount={costs.adhocAnnualPrice} adminSettings={adminSettings} onAdminChange={onAdminChange} /></span>
                    </div>
                    <div className="flex justify-between items-center text-green-700 font-bold mb-2 pb-2 border-b border-green-200/50">
                      <span>Bu Paketle Kazancınız:</span>
                      <span><PriceDisplay amount={costs.adhocAnnualPrice - costs.annualPrice} adminSettings={adminSettings} onAdminChange={onAdminChange} /></span>
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
                    <span>Cihaz İşçiliği ({costs.breakdown.equipmentHours.toFixed(1)}s):</span>
                    <span className="font-medium"><PriceDisplay amount={costs.breakdown.equipmentCost} adminSettings={adminSettings} onAdminChange={onAdminChange} /></span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ziyaret / Yol ({costs.breakdown.visitHours.toFixed(1)}s):</span>
                    <span className="font-medium"><PriceDisplay amount={costs.breakdown.visitCost} adminSettings={adminSettings} onAdminChange={onAdminChange} /></span>
                  </div>
                  {costs.breakdown.proactiveHours > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Uzaktan Destek ({costs.breakdown.proactiveHours.toFixed(1)}s):</span>
                      <span className="font-medium"><PriceDisplay amount={costs.breakdown.proactiveCost} adminSettings={adminSettings} onAdminChange={onAdminChange} /></span>
                    </div>
                  )}

                  {costs.breakdown.logisticsCost > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Lojistik (Yakıt/Otopark):</span>
                      <span className="font-medium"><PriceDisplay amount={costs.breakdown.logisticsCost} adminSettings={adminSettings} onAdminChange={onAdminChange} /></span>
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
      </div>

      {/* Add-on Services Section */}
      {(() => {
        const addonServices = (adminSettings.catalog || []).filter(item => item.type === 'service');
        if (addonServices.length === 0) return null;
        const toggleAddon = (id: string) => {
          const current = config.selectedAddons || [];
          const next = current.includes(id) ? current.filter(a => a !== id) : [...current, id];
          onChange({ ...config, selectedAddons: next });
        };
        return (
          <div className="mt-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Settings2 className="w-5 h-5 mr-2 text-indigo-500" />
                Ek Hizmetler (Add-ons)
              </h3>
              <p className="text-sm text-gray-500 mt-1">Seçtiğiniz pakete eklemek istediğiniz ek hizmetleri işaretleyin. Seçiminiz fiyata otomatik yansıyacaktır.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {addonServices.map((service) => {
                const isSelected = (config.selectedAddons || []).includes(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleAddon(service.id)}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-gray-50 hover:border-indigo-200 hover:bg-white'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold leading-tight ${isSelected ? 'text-indigo-900' : 'text-gray-800'}`}>{service.name}</p>
                      {service.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                      )}
                      {service.costType !== 'free' && service.costValue > 0 && (
                        <p className="text-xs font-medium text-indigo-600 mt-1">
                          +{service.costValue} {service.costType === 'hourly' ? 'sa/yıl' : `₺/${service.costType === 'monthly' ? 'ay' : 'yıl'}`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
