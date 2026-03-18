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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              {/* Inventory Details Inside Package */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Proje Envanteri</h4>
                <div className="flex space-x-4 mb-3 text-sm">
                  <div><span className="text-gray-500">Oda:</span> <span className="font-medium">{roomCount}</span></div>
                  <div><span className="text-gray-500">Ekipman:</span> <span className="font-medium">{config.locations.reduce((acc, loc) => acc + loc.rooms.reduce((s, r) => s + r.equipment.reduce((eqSum, e) => eqSum + e.quantity, 0), 0), 0)}</span></div>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-700">İşçilik Detayları</h5>
                  <div className="space-y-2">
                    {Array.from(new Set(config.locations.flatMap(loc => loc.rooms.flatMap(r => r.equipment.map(e => e.catalogId))))).map(catalogId => {
                      const item = adminSettings.catalog?.find(c => c.id === catalogId);
                      if (!item) return null;
                      return (
                        <div key={catalogId} className="bg-gray-50 p-2 rounded border border-gray-100 text-xs">
                          <span className="font-medium text-gray-900 block">{item.name}</span>
                          <span className="text-gray-600">{item.description || 'Açıklama girilmemiş.'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Hizmetler</h4>
                {(pkg.includedServices || []).map((serviceId, i) => {
                  const catalogItem = adminSettings.catalog?.find(item => item.id === serviceId);
                  return (
                    <div key={`inc-${i}`} className="flex items-start space-x-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-gray-700">
                        {catalogItem ? catalogItem.name : 'Bilinmeyen Hizmet'}
                        {catalogItem?.costType === 'per_unit' && ` (${catalogItem.unitCount || 1} Adet)`}
                      </span>
                    </div>
                  );
                })}
                {(pkg.excludedServices || []).map((serviceId, i) => {
                  const catalogItem = adminSettings.catalog?.find(item => item.id === serviceId);
                  return (
                    <div key={`exc-${i}`} className="flex items-start space-x-2 text-sm">
                      <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <span className="text-gray-500 line-through">
                        {catalogItem ? catalogItem.name : 'Bilinmeyen Hizmet'}
                        {catalogItem?.costType === 'per_unit' && ` (${catalogItem.unitCount || 1} Adet)`}
                      </span>
                    </div>
                  );
                })}
              </div>

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

      {/* Billing Cycle */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ödeme Planı</h3>
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Dönemi</label>
          <select
            value={config.billingCycle}
            onChange={(e) => updateField('billingCycle', e.target.value)}
            className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            {BILLING_CYCLES.map(cycle => (
              <option key={cycle} value={cycle}>{cycle}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
