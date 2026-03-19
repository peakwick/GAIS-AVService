import React, { useState } from 'react';
import { AdminSettings, ServicePackageDef, CatalogItem, CostType } from '../../types';
import { LOCATIONS, BILLING_CYCLES } from '../../constants/avConstants';
import { Settings, Users, Clock, MapPin, Percent, Package, Plus, Trash2, List, Monitor, Mic, Video, Speaker, Box, Wrench, Check, FileText } from 'lucide-react';

interface AVAdminPanelProps {
  settings: AdminSettings;
  onChange: (settings: AdminSettings) => void;
}

export function AVAdminPanel({ settings, onChange }: AVAdminPanelProps) {
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
    const newId = `pkg_${Date.now()}`;
    onChange({
      ...settings,
      servicePackages: [
        ...(settings.servicePackages || []),
        { id: newId, label: 'Yeni Paket', incidentVisits: 0, proactiveVisits: 0, desc: '' }
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
      id: `${type === 'equipment' ? 'eq' : 'srv'}_${Date.now()}`,
      type,
      name: `Yeni ${type === 'equipment' ? 'Ekipman' : 'Hizmet'}`,
      description: '',
      costType: 'free',
      costValue: 0,
      icon: type === 'equipment' ? 'speaker' : 'tool'
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

  const dailyRate = (settings.techMonthlySalary + settings.techMonthlyOverhead) / settings.workingDaysPerMonth;
  const hourlyRate = dailyRate / 8;

  const services = (settings.catalog || []).filter(c => c.type === 'service');

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Yönetici Ayarları</h2>
        <p className="text-gray-500 mt-1">Fiyatlandırma hesaplamalarında kullanılan maliyetleri, zaman tahminlerini ve kar marjlarını yapılandırın.</p>
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
          İçerik Yönetimi
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`py-3 px-6 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'packages'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Hizmet Paketleri
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
                <h3 className="text-lg font-medium text-gray-900">Ekipmanlar</h3>
                <button
                  onClick={() => addCatalogItem('equipment')}
                  className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ekipman Ekle</span>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ekipman Adı</label>
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
                            value={item.icon || 'speaker'}
                            onChange={(e) => updateCatalogItem(index, 'icon', e.target.value)}
                            className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          >
                            <option value="monitor">Ekran</option>
                            <option value="video">Kamera</option>
                            <option value="mic">Mikrofon</option>
                            <option value="settings">DSP</option>
                            <option value="box">Kontrol Sistemi</option>
                            <option value="speaker">Hoparlör</option>
                            <option value="tool">Araç</option>
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
                              {item.costType === 'hourly' ? 'Süre (Saat)' : 'Maliyet (₺)'}
                            </label>
                            <input
                              type="number"
                              step={item.costType === 'hourly' ? "0.5" : "1"}
                              value={item.costValue}
                              onChange={(e) => updateCatalogItem(index, 'costValue', Number(e.target.value))}
                              className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama (İşçilik Detayı)</label>
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => updateCatalogItem(index, 'description', e.target.value)}
                            className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Örn: Ekran temizliği, bağlantı kontrolü..."
                          />
                        </div>
                        <div className="md:col-span-2 flex items-center mt-2">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.isDefaultRoomEquipment || false}
                              onChange={(e) => updateCatalogItem(index, 'isDefaultRoomEquipment', e.target.checked)}
                              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Yeni odalarda varsayılan olarak eklensin</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Hizmetler</h3>
                <p className="text-xs text-gray-500 mt-1 italic font-medium">(Kar eklenmeden önceki tüm maliyet değerlerini giriniz)</p>
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
                            <option value="per_unit">Adet / Kullanım Başına</option>
                          </select>
                        </div>
                        {item.costType !== 'free' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {item.costType === 'hourly' ? 'Süre (Saat)' : 'Maliyet (₺)'}
                            </label>
                            <input
                              type="number"
                              step={item.costType === 'hourly' ? "0.5" : "1"}
                              value={item.costValue}
                              onChange={(e) => updateCatalogItem(index, 'costValue', Number(e.target.value))}
                              className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                        )}
                        {item.costType === 'per_unit' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Yıllık Adet</label>
                            <input
                              type="number"
                              min="1"
                              value={item.unitCount || 1}
                              onChange={(e) => updateCatalogItem(index, 'unitCount', Number(e.target.value))}
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
          </div>
        )}

        {/* Service Packages Management */}
        {activeTab === 'packages' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Hizmet Paketleri Yönetimi</h3>
            <button
              onClick={addPackage}
              className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Paket Ekle</span>
            </button>
          </div>
          
          <div className="space-y-6">
            {(settings.servicePackages || []).map((pkg, index) => (
              <div key={pkg.id} className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 relative">
                <button
                  onClick={() => removePackage(index)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                  title="Paketi Sil"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paket Adı</label>
                    <input
                      type="text"
                      value={pkg.label}
                      onChange={(e) => handlePackageChange(index, 'label', e.target.value)}
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arıza Müdahale (Yıllık)</label>
                    <input
                      type="number"
                      value={pkg.incidentVisits || 0}
                      onChange={(e) => handlePackageChange(index, 'incidentVisits', Number(e.target.value))}
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Önleyici Bakım (Yıllık)</label>
                    <input
                      type="number"
                      value={pkg.proactiveVisits || 0}
                      onChange={(e) => handlePackageChange(index, 'proactiveVisits', Number(e.target.value))}
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <input
                      type="text"
                      value={pkg.desc}
                      onChange={(e) => handlePackageChange(index, 'desc', e.target.value)}
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maksimum Oda Sayısı (Uyarı için)</label>
                    <input
                      type="number"
                      value={pkg.maxRooms || ''}
                      onChange={(e) => handlePackageChange(index, 'maxRooms', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Örn: 10"
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
        )}

        {/* Global Included Services */}
        {activeTab === 'packages' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-500" />
              Her Pakette Dahil Olan Hizmetler
            </h3>
            <p className="text-sm text-gray-500 mt-1">Tüm paketlerde otomatik dahil olan standart hizmetler. Paket kartlarında ve teklifte gösterilir.</p>
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
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newIncluded ?? ''}
              onChange={(e) => setNewIncluded(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (newIncluded ?? '').trim()) {
                  handleChange('globalIncludedServices', [...(settings.globalIncludedServices || []), newIncluded!.trim()]);
                  setNewIncluded('');
                }
              }}
              placeholder="Hizmet adı yazın ve Enter'a basın..."
              className="flex-1 rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
            />
            <button
              onClick={() => {
                if ((newIncluded ?? '').trim()) {
                  handleChange('globalIncludedServices', [...(settings.globalIncludedServices || []), newIncluded!.trim()]);
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
        )}

        {/* Global Excluded Services */}
        {activeTab === 'packages' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <List className="w-5 h-5 mr-2 text-red-400" />
                Genel Olarak Dahil Olmayan Hizmetler
              </h3>
              <p className="text-sm text-gray-500 mt-1">Tüm paketlerde kapsam dışı olan ve ayrıca teklif gerektiren işler. Bunlar fiyatlandırmaya dahil edilmez.</p>
            </div>
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
          {/* New item input */}
          <div className="flex gap-2 mt-2">
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
              placeholder="Hizmet adı yazın ve Enter'a basın..."
              className="flex-1 rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <button
              onClick={() => {
                if (newExclusion.trim()) {
                  handleChange('globalExcludedServices', [...(settings.globalExcludedServices || []), newExclusion.trim()]);
                  setNewExclusion('');
                }
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Ekle</span>
            </button>
          </div>
        </div>
        )}

        {/* Personnel Costs */}
        {activeTab === 'costs' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2 mb-8">
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
                  className="pl-8 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                  className="pl-8 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">Gün</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-center">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <span className="block text-gray-500 mb-1 text-xs uppercase tracking-wider font-semibold">Saatlik Maliyet</span>
              <span className="font-bold text-indigo-700 text-lg">₺{hourlyRate.toFixed(2)}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <span className="block text-gray-500 mb-1 text-xs uppercase tracking-wider font-semibold">Yarım Gün (4 sa)</span>
              <span className="font-bold text-indigo-700 text-lg">₺{(hourlyRate * 4).toFixed(2)}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <span className="block text-gray-500 mb-1 text-xs uppercase tracking-wider font-semibold">Günlük Maliyet (8 sa)</span>
              <span className="font-bold text-indigo-700 text-lg">₺{(hourlyRate * 8).toFixed(2)}</span>
            </div>
          </div>
        </div>
        )}

        {/* Currency and Margin */}
        {activeTab === 'costs' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Percent className="w-5 h-5 mr-2 text-indigo-500" />
            Döviz Kuru ve Kar Marjı
          </h3>
          <p className="text-sm text-gray-500 mb-6">Fiyatlandırmada kullanılacak güncel dolar kurunu ve eklenecek kar marjını belirleyin.</p>
          
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
                  className="pl-8 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yıllık Bakım Kar Marjı (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.markupPercentage || 0}
                  onChange={(e) => handleChange('markupPercentage', Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">%</span>
              </div>
            </div>
            
            <div className="sm:col-span-2 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Anlaşmasız (Per Call) Fiyatlandırma</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hesaplama Yöntemi</label>
                  <select
                    value={settings.adhocCalculationMethod || 'markup'}
                    onChange={(e) => handleChange('adhocCalculationMethod', e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="markup">Yüksek Kar Marjı (% İle)</option>
                    <option value="fixed_visit">Sabit Servis Ücreti (Ziyaret Başı)</option>
                  </select>
                </div>

                {(!settings.adhocCalculationMethod || settings.adhocCalculationMethod === 'markup') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anlaşmasız Kar Marjı (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.adhocMarkupPercentage !== undefined ? settings.adhocMarkupPercentage : 100}
                        onChange={(e) => handleChange('adhocMarkupPercentage', Number(e.target.value))}
                        className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">%</span>
                    </div>
                  </div>
                )}

                {settings.adhocCalculationMethod === 'fixed_visit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sabit Ziyaret Ücreti Değeri</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₺</span>
                      <input
                        type="number"
                        value={settings.fixedPerCallPrice || 0}
                        onChange={(e) => handleChange('fixedPerCallPrice', Number(e.target.value))}
                        className="pl-8 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Logistics Costs */}
        {activeTab === 'costs' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
            Saha Ziyareti Lojistik Maliyetleri
          </h3>
          <p className="text-sm text-gray-500 mb-6">Her bir saha ziyareti (arıza müdahalesi veya önleyici bakım) için eklenecek sabit maliyetler.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ortalama Yakıt Maliyeti (Ziyaret Başına)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₺</span>
                <input
                  type="number"
                  value={settings.fuelCostPerVisit || 0}
                  onChange={(e) => handleChange('fuelCostPerVisit', Number(e.target.value))}
                  className="pl-8 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                  className="pl-8 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Economies of Scale */}
        {activeTab === 'costs' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Percent className="w-5 h-5 mr-2 text-indigo-500" />
            Ölçek Ekonomisi (Grup İndirimi)
          </h3>
          <p className="text-sm text-gray-500 mb-6">Aynı lokasyonda (binada) çok sayıda oda olması durumunda işçilikten (ekipman bakım sürelerinden) kazanılacak verimliliği yansıtan ardışık indirimleri belirleyin.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İndirim Başlangıcı (Oda Sayısı)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={settings.scaleDiscountThreshold ?? 5}
                  onChange={(e) => handleChange('scaleDiscountThreshold', Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Bu sayının üzerindeki HER ekstra oda için indirim uygulanır.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ekstra Oda Başına İndirim (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={settings.scaleDiscountRatePerRoom ?? 2}
                  onChange={(e) => handleChange('scaleDiscountRatePerRoom', Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maksimum İndirim Sınırı (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={settings.scaleMaxDiscount ?? 20}
                  onChange={(e) => handleChange('scaleMaxDiscount', Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">%</span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Billing Cycle Multipliers */}
        {activeTab === 'costs' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-500" />
            Ödeme Planı Çarpanları
          </h3>
          <p className="text-sm text-gray-500 mb-6">Müşterinin seçtiği fatura dönemine göre (Aylık, Yıllık vb.) toplam fiyata uygulanacak çarpanı belirleyin. Peşin ödemelere avantaj sağlamak veya vadeli ödemelere vade farkı eklemek için kullanabilirsiniz.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {BILLING_CYCLES.map(cycle => (
              <div key={cycle}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{cycle}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    value={settings.billingCycleMultiplier?.[cycle] || 1.0}
                    onChange={(e) => handleNestedChange('billingCycleMultiplier', cycle, Number(e.target.value))}
                    className="w-full rounded-lg border-gray-300 border p-2 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Location Multipliers */}
        {activeTab === 'costs' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
            Konum Çarpanları
          </h3>
          <p className="text-sm text-gray-500 mb-6">Farklı şehirler için operasyon zorluğu ve seyahat maliyeti çarpanı belirleyin. Saha ziyaret maliyetleri bu katsayı ile çarpılır.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {LOCATIONS.map(loc => (
              <div key={loc}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{loc}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={settings.locationMultiplier?.[loc] || 1}
                    onChange={(e) => handleNestedChange('locationMultiplier', loc, Number(e.target.value))}
                    className="w-full rounded-lg border-gray-300 border p-2 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Time Estimates */}
        {activeTab === 'costs' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Zaman Tahminleri & Uzaktan Destek (Saat)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="pt-4 border-t border-gray-100 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Saha Ziyareti Başına Temel Süre (Yol/Hazırlık)</label>
              <div className="relative max-w-xs">
                <input
                  type="number"
                  step="0.5"
                  value={settings.basePreventativeVisitHours}
                  onChange={(e) => handleChange('basePreventativeVisitHours', Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 border p-2 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">sa</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Ziyaret başına temel seyahat/kurulum süresi. Ekipman kontrol süresi otomatik olarak eklenir.</p>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Uzaktan Destek Temel Süresi (Yıllık)</label>
              <div className="relative max-w-xs">
                <input
                  type="number"
                  value={settings.remoteSupportBaseHours}
                  onChange={(e) => handleChange('remoteSupportBaseHours', Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 border p-2 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">sa</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Proaktif bakım için sabit yıllık süre.</p>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Oda Başına Ek Uzaktan Destek (Yıllık)</label>
              <div className="relative max-w-xs">
                <input
                  type="number"
                  step="0.5"
                  value={settings.remoteSupportHoursPerRoom}
                  onChange={(e) => handleChange('remoteSupportHoursPerRoom', Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 border p-2 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">sa</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Her bir oda için eklenecek yıllık uzaktan destek süresi.</p>
            </div>

          </div>
        </div>
        )}
        {/* Contract Terms Management */}
        {activeTab === 'terms' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-500" />
              Sözleşme Özel Şartları (Varsayılan)
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Yeni oluşturulan tekliflerde varsayılan olarak gelecek özel şartları ve koşulları buraya ekleyin. Her bir maddeyi yeni satırda belirtin.
            </p>
            <div className="space-y-4">
              <textarea
                value={settings.defaultCustomConditions}
                onChange={(e) => handleChange('defaultCustomConditions', e.target.value)}
                rows={12}
                placeholder="Her maddeyi yeni bir satıra yazın..."
                className="w-full rounded-xl border-gray-300 border p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none leading-relaxed min-h-[300px]"
              />
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                  <strong>İpucu:</strong> Buraya yazdığınız maddeler, her yeni teklif oluşturulduğunda otomatik olarak "Özel Şartlar ve Koşullar" bölümüne eklenecektir. Teklif bazlı değişiklikleri yine teklif hazırlar kısmından yapabilirsiniz.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
