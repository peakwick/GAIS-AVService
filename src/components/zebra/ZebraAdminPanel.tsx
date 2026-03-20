import React, { useState } from 'react';
import { AdminSettings, ServicePackageDef, CatalogItem, CostType, GeneralSettings } from '../../types';
import { LOCATIONS, BILLING_CYCLES } from '../../constants/zebraConstants';
import { Settings, Users, Clock, MapPin, Percent, Package, Plus, Trash2, List, Smartphone, Printer, Tablet, Box, Wrench, Check, FileText, Globe } from 'lucide-react';

interface ZebraAdminPanelProps {
  settings: AdminSettings;
  generalSettings: GeneralSettings;
  onChange: (settings: AdminSettings) => void;
}

export function ZebraAdminPanel({ settings, generalSettings, onChange }: ZebraAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'costs' | 'catalog' | 'packages' | 'terms'>('costs');
  const [newExclusion, setNewExclusion] = useState('');
  const [newIncluded, setNewIncluded] = useState('');

  const handleChange = (field: keyof AdminSettings, value: any) => {
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

  const handlePackageChange = (index: number, field: keyof ServicePackageDef, value: any) => {
    const newPackages = [...(settings.servicePackages || [])];
    newPackages[index] = { ...newPackages[index], [field]: value };
    onChange({ ...settings, servicePackages: newPackages });
  };

  const addPackage = () => {
    const newId = `z_pkg_${Date.now()}`;
    onChange({
      ...settings,
      servicePackages: [
        ...(settings.servicePackages || []),
        { id: newId, label: 'Yeni Zebra Paketi', incidentVisits: 0, proactiveVisits: 0, desc: '' }
      ]
    });
  };

  const removePackage = (index: number) => {
    const newPackages = [...(settings.servicePackages || [])];
    newPackages.splice(index, 1);
    onChange({ ...settings, servicePackages: newPackages });
  };


  // Catalog Management
  const addCatalogItem = (type: 'equipment' | 'service') => {
    const newItem: CatalogItem = {
      id: `z_${type === 'equipment' ? 'eq' : 'srv'}_${Date.now()}`,
      type,
      name: `Yeni Zebra ${type === 'equipment' ? 'Cihazı' : 'Hizmeti'}`,
      description: '',
      costType: 'free',
      costValue: 0,
      icon: type === 'equipment' ? 'smartphone' : 'tool'
    };
    onChange({
      ...settings,
      catalog: [...(settings.catalog || []), newItem]
    });
  };

  const updateCatalogItem = (index: number, field: keyof CatalogItem, value: any) => {
    const newCatalog = [...(settings.catalog || [])];
    newCatalog[index] = { ...newCatalog[index], [field]: value };
    onChange({ ...settings, catalog: newCatalog });
  };

  const removeCatalogItem = (index: number) => {
    const newCatalog = [...(settings.catalog || [])];
    newCatalog.splice(index, 1);
    onChange({ ...settings, catalog: newCatalog });
  };

  const dailyRate = (generalSettings.techMonthlySalary + generalSettings.techMonthlyOverhead) / generalSettings.workingDaysPerMonth;
  const hourlyRate = dailyRate / 8;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Zebra Yönetici Ayarları</h2>
        <p className="text-gray-500 mt-1">Zebra donanım bakım maliyetlerini ve içeriklerini yapılandırın.</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('costs')}
          className={`py-3 px-6 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'costs'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Maliyet & Fiyatlandırma
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-3 px-6 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'catalog'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Ürün & Hizmet Kataloğu
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`py-3 px-6 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'packages'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Bakım Paketleri
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`py-3 px-6 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'terms'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Sözleşme Şartları
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Catalog Management */}
        {activeTab === 'catalog' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Zebra Cihazları</h3>
                <button
                  onClick={() => addCatalogItem('equipment')}
                  className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cihaz Tipi Ekle</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {(settings.catalog || []).map((item, index) => {
                  if (item.type !== 'equipment') return null;
                  return (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 relative">
                      <button
                        onClick={() => removeCatalogItem(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cihaz Tipi Adı</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateCatalogItem(index, 'name', e.target.value)}
                            className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">İkon</label>
                          <select
                            value={item.icon || 'smartphone'}
                            onChange={(e) => updateCatalogItem(index, 'icon', e.target.value)}
                            className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          >
                            <option value="smartphone">El Terminali</option>
                            <option value="printer">Yazıcı</option>
                            <option value="tablet">Tablet</option>
                            <option value="box">Okuyucu</option>
                            <option value="settings">Sensör</option>
                            <option value="tool">Diğer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Maliyet Tipi</label>
                          <select
                            value={item.costType}
                            onChange={(e) => updateCatalogItem(index, 'costType', e.target.value as CostType)}
                            className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          >
                            <option value="free">Ücretsiz</option>
                            <option value="hourly">Saatlik (Bakım Süresi)</option>
                            <option value="monthly">Aylık Sabit</option>
                            <option value="annual">Yıllık Sabit</option>
                          </select>
                        </div>
                        {item.costType !== 'free' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {item.costType === 'hourly' ? 'Süre (Saat/Cihaz)' : 'Maliyet (₺/Cihaz)'}
                            </label>
                            <input
                              type="number"
                              step={item.costType === 'hourly' ? "0.01" : "1"}
                              value={item.costValue}
                              onChange={(e) => updateCatalogItem(index, 'costValue', Number(e.target.value))}
                              className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => updateCatalogItem(index, 'description', e.target.value)}
                            className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Ek Hizmetler (Add-ons)</h3>
                <button
                  onClick={() => addCatalogItem('service')}
                  className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Hizmet Ekle</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {(settings.catalog || []).map((item, index) => {
                  if (item.type !== 'service') return null;
                  return (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 relative">
                      <button
                        onClick={() => removeCatalogItem(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Hizmet Adı</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateCatalogItem(index, 'name', e.target.value)}
                            className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Maliyet Tipi</label>
                          <select
                            value={item.costType}
                            onChange={(e) => updateCatalogItem(index, 'costType', e.target.value as CostType)}
                            className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          >
                            <option value="free">Ücretsiz</option>
                            <option value="hourly">Saatlik (Bakım Süresi)</option>
                            <option value="monthly">Aylık Sabit</option>
                            <option value="annual">Yıllık Sabit</option>
                            <option value="per_unit">Cihaz Başına</option>
                          </select>
                        </div>
                        {item.costType !== 'free' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {item.costType === 'hourly' ? 'Süre (Saat)' : 'Maliyet (₺)'}
                            </label>
                            <input
                              type="number"
                              step={item.costType === 'hourly' ? "0.1" : "1"}
                              value={item.costValue}
                              onChange={(e) => updateCatalogItem(index, 'costValue', Number(e.target.value))}
                              className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Similar tabs for costs, packages, terms adapted for Zebra */}
        {activeTab === 'costs' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Percent className="w-5 h-5 mr-2 text-indigo-500" />
                Kar Marjı ve Ölçek Ekonomisi
              </h3>
              <p className="text-sm text-gray-500 mb-6">Fiyatlandırmada kullanılacak kar marjını ve toplu cihaz indirimlerini belirleyin. Personel maliyetleri "Genel Ayarlar" sekmesinden yönetilir.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kar Marjı (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.markupPercentage || 0}
                      onChange={(e) => handleChange('markupPercentage', Number(e.target.value))}
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İndirim Başlangıcı (Adet)</label>
                  <input
                    type="number"
                    value={settings.scaleDiscountThreshold || 5}
                    onChange={(e) => handleChange('scaleDiscountThreshold', Number(e.target.value))}
                    className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cihaz Başı İndirim (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={settings.scaleDiscountRatePerRoom || 1}
                      onChange={(e) => handleChange('scaleDiscountRatePerRoom', Number(e.target.value))}
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ad-hoc Calculation Settings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-amber-500" />
                Anlaşmasız (Per-Call) Teklif Ayarları
              </h3>
              <p className="text-sm text-gray-500 mb-6">Bakım anlaşması olmayan müşteriler için "Karşılaştırmalı Per-Call Fiyatı" hesaplama yöntemini belirleyin.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hesaplama Yöntemi</label>
                  <select
                    value={settings.adhocCalculationMethod || 'markup'}
                    onChange={(e) => handleChange('adhocCalculationMethod', e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="markup">Maliyet Üzerinden Yüksek Kar Marjı</option>
                    <option value="fixed_visit">Sabit Ziyaret Başı Ücret</option>
                  </select>
                </div>

                {settings.adhocCalculationMethod === 'fixed_visit' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sabit Ziyaret Ücreti (₺)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.fixedPerCallPrice || 0}
                        onChange={(e) => handleChange('fixedPerCallPrice', Number(e.target.value))}
                        className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">₺</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad-hoc Kar Marjı (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.adhocMarkupPercentage || 100}
                        onChange={(e) => handleChange('adhocMarkupPercentage', Number(e.target.value))}
                        className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Zebra Bakım Paketleri</h3>
              <button onClick={addPackage} className="text-sm text-indigo-600 font-medium hover:underline">+ Yeni Paket</button>
            </div>
            <div className="space-y-6">
              {(settings.servicePackages || []).map((pkg, index) => (
                <div key={pkg.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
                  <button onClick={() => removePackage(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input value={pkg.label} onChange={(e) => handlePackageChange(index, 'label', e.target.value)} className="rounded border-gray-300 p-2 text-sm" placeholder="Paket Adı" />
                    <input type="number" value={pkg.incidentVisits} onChange={(e) => handlePackageChange(index, 'incidentVisits', Number(e.target.value))} className="rounded border-gray-300 p-2 text-sm" placeholder="Arıza Müdahale" />
                    <input type="number" value={pkg.proactiveVisits} onChange={(e) => handlePackageChange(index, 'proactiveVisits', Number(e.target.value))} className="rounded border-gray-300 p-2 text-sm" placeholder="Önleyici Bakım" />
                    <input value={pkg.desc} onChange={(e) => handlePackageChange(index, 'desc', e.target.value)} className="md:col-span-3 rounded border-gray-300 p-2 text-sm" placeholder="Açıklama" />
                  </div>
                </div>
              ))}
            </div>

            {/* Global Included Services */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Check className="w-5 h-5 mr-2 text-green-500" />
                  Her Pakette Dahil Olan Hizmetler
                </h3>
                <p className="text-sm text-gray-500 mt-1">Tüm Zebra paketlerinde otomatik dahil olan standart hizmetler.</p>
              </div>
              <div className="space-y-2 mb-4">
                {(settings.globalIncludedServices || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50/60 border border-green-100 rounded-lg text-sm text-gray-700 group">
                    <span>{item}</span>
                    <button
                      onClick={() => {
                        const arr = [...(settings.globalIncludedServices || [])];
                        arr.splice(idx, 1);
                        handleChange('globalIncludedServices', arr);
                      }}
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIncluded}
                  onChange={(e) => setNewIncluded(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newIncluded.trim()) {
                      handleChange('globalIncludedServices', [...(settings.globalIncludedServices || []), newIncluded.trim()]);
                      setNewIncluded('');
                    }
                  }}
                  placeholder="Hizmet adı..."
                  className="flex-1 rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                />
                <button
                  onClick={() => {
                    if (newIncluded.trim()) {
                      handleChange('globalIncludedServices', [...(settings.globalIncludedServices || []), newIncluded.trim()]);
                      setNewIncluded('');
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ekle</span>
                </button>
              </div>
            </div>

            {/* Global Excluded Services */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <List className="w-5 h-5 mr-2 text-red-400" />
                  Genel Olarak Dahil Olmayan Hizmetler
                </h3>
                <p className="text-sm text-gray-500 mt-1">Tüm Zebra paketlerinde kapsam dışı olan işler.</p>
              </div>
              <div className="space-y-2 mb-4">
                {(settings.globalExcludedServices || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-red-50/60 border border-red-100 rounded-lg text-sm text-gray-700 group">
                    <span>{item}</span>
                    <button
                      onClick={() => {
                        const arr = [...(settings.globalExcludedServices || [])];
                        arr.splice(idx, 1);
                        handleChange('globalExcludedServices', arr);
                      }}
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newExclusion.trim()) {
                      handleChange('globalExcludedServices', [...(settings.globalExcludedServices || []), newExclusion.trim()]);
                      setNewExclusion('');
                    }
                  }}
                  placeholder="Kapsam dışı hizmet..."
                  className="flex-1 rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-red-400 outline-none"
                />
                <button
                  onClick={() => {
                    if (newExclusion.trim()) {
                      handleChange('globalExcludedServices', [...(settings.globalExcludedServices || []), newExclusion.trim()]);
                      setNewExclusion('');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ekle</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Varsayılan Sözleşme Şartları</h3>
            <textarea
              value={settings.defaultCustomConditions}
              onChange={(e) => handleChange('defaultCustomConditions', e.target.value)}
              className="w-full h-64 rounded-xl border-gray-300 border p-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
}
