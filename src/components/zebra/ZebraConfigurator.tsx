import { ConfigState, Equipment, AdminSettings, ProjectLocation, GeneralSettings } from '../../types';
import { LOCATIONS, BILLING_CYCLES } from '../../constants/zebraConstants';
import { Plus, Trash2, Monitor, Mic, Video, Settings, Speaker, Box, Wrench, MapPin, Smartphone, Printer, Tablet } from 'lucide-react';

interface ZebraConfiguratorProps {
  config: ConfigState;
  adminSettings: AdminSettings;
  generalSettings: GeneralSettings;
  onChange: (config: ConfigState) => void;
}

const getIconForType = (iconName?: string) => {
  switch (iconName) {
    case 'monitor': return <Smartphone className="w-4 h-4" />;
    case 'video': return <Printer className="w-4 h-4" />;
    case 'mic': return <Tablet className="w-4 h-4" />;
    case 'settings': return <Settings className="w-4 h-4" />;
    case 'box': return <Box className="w-4 h-4" />;
    case 'speaker': return <Printer className="w-4 h-4" />;
    case 'tool': return <Wrench className="w-4 h-4" />;
    default: return <Smartphone className="w-4 h-4" />;
  }
};

export function ZebraConfigurator({ config, adminSettings, generalSettings, onChange }: ZebraConfiguratorProps) {
  const updateField = (field: keyof ConfigState, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const equipmentCatalog = adminSettings.catalog?.filter(c => c.type === 'equipment') || [];

  const addLocation = () => {
    const newLocation: ProjectLocation = {
      id: crypto.randomUUID(),
      name: `Konum ${config.locations.length + 1}`,
      city: LOCATIONS[0],
      equipment: []
    };
    updateField('locations', [...config.locations, newLocation]);
  };

  const removeLocation = (locId: string) => {
    updateField('locations', config.locations.filter(l => l.id !== locId));
  };

  const updateLocation = (locId: string, field: keyof ProjectLocation, value: any) => {
    updateField('locations', config.locations.map(l => l.id === locId ? { ...l, [field]: value } : l));
  };

  const addEquipment = (locId: string, catalogId: string) => {
    updateField('locations', config.locations.map(l => {
      if (l.id === locId) {
        const existing = (l.equipment || []).find(e => e.catalogId === catalogId);
        if (existing) {
          return {
            ...l,
            equipment: (l.equipment || []).map(e => e.catalogId === catalogId ? { ...e, quantity: e.quantity + 10 } : e)
          };
        }
        return {
          ...l,
          equipment: [...(l.equipment || []), { id: crypto.randomUUID(), catalogId, quantity: 10 }]
        };
      }
      return l;
    }));
  };

  const updateEquipmentQuantity = (locId: string, eqId: string, quantity: number) => {
    updateField('locations', config.locations.map(l => {
      if (l.id === locId) {
        if (quantity < 1) {
          return { ...l, equipment: (l.equipment || []).filter(e => e.id !== eqId) };
        }
        return {
          ...l,
          equipment: (l.equipment || []).map(e => e.id === eqId ? { ...e, quantity } : e)
        };
      }
      return l;
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Zebra Proje Yapılandırması</h2>
        <p className="text-gray-500 mt-1">Müşteri detaylarını, konumları ve cihaz adetlerini belirleyin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Client Details */}
        <div className="space-y-8 lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Müşteri Detayları</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Adı</label>
                <input
                  type="text"
                  value={config.clientName}
                  onChange={(e) => updateField('clientName', e.target.value)}
                  placeholder="örn. Lojistik A.Ş."
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proje Adı</label>
                <input
                  type="text"
                  value={config.projectName}
                  onChange={(e) => updateField('projectName', e.target.value)}
                  placeholder="örn. Depo Terminal Bakım"
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bakım Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={config.contractStartDate}
                  onChange={(e) => updateField('contractStartDate', e.target.value)}
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bakım Süresi ve Bitiş</label>
                <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  <span className="text-gray-600 font-medium">12 Ay (Sabit)</span>
                  <div className="flex items-center space-x-1 text-indigo-700 font-bold">
                    <span>Bitiş:</span>
                    <span>
                      {(() => {
                        if (!config.contractStartDate) return '-';
                        const d = new Date(config.contractStartDate);
                        d.setFullYear(d.getFullYear() + 1);
                        return d.toLocaleDateString('tr-TR');
                      })()}
                    </span>
                  </div>
                </div>
              </div>
              <div>
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
        </div>

        {/* Right Column: Locations & Equipment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Konumlar ve Cihazlar</h3>
            <button
              onClick={addLocation}
              className="flex items-center space-x-1 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Konum Ekle</span>
            </button>
          </div>

          {config.locations.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
              <p className="text-gray-500">Henüz konum eklenmedi. Yapılandırmaya başlamak için "Konum Ekle"ye tıklayın.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {config.locations.map((location) => (
                <div key={location.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex flex-wrap items-center gap-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-[200px]">
                      <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                      <input
                        type="text"
                        value={location.name}
                        onChange={(e) => updateLocation(location.id, 'name', e.target.value)}
                        className="bg-transparent border-none p-0 focus:ring-0 text-base font-bold text-gray-900 w-full outline-none placeholder:text-gray-400"
                        placeholder="Depo / Ofis Adı"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                       <select
                        value={location.city}
                        onChange={(e) => updateLocation(location.id, 'city', e.target.value)}
                        className="rounded-lg border-gray-300 border py-1.5 pl-3 pr-8 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-gray-700"
                      >
                        {LOCATIONS.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeLocation(location.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors"
                      title="Konumu Sil"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-4 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Cihaz Envanteri</h4>
                      <div className="flex flex-wrap gap-2">
                        {equipmentCatalog.filter(item => !(location.equipment || []).some(eq => eq.catalogId === item.id)).map(item => (
                          <button
                            key={item.id}
                            onClick={() => addEquipment(location.id, item.id)}
                            className="flex items-center space-x-1 text-[11px] bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded hover:border-indigo-300 hover:text-indigo-700 transition-colors font-medium shadow-sm"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{item.name} Ekle</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {(location.equipment || []).length === 0 ? (
                      <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-200">
                        <p className="text-sm text-gray-400">Bu konuma henüz cihaz eklenmedi.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {(location.equipment || []).map((eq) => {
                          const catalogItem = equipmentCatalog.find(c => c.id === eq.catalogId);
                          return (
                            <div key={eq.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                                  {getIconForType(catalogItem?.icon)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-900 leading-tight truncate">{catalogItem?.name || 'Bilinmeyen Cihaz'}</p>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5 truncate">{catalogItem?.description}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between sm:justify-end space-x-4">
                                <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-100">
                                  <div className="flex items-center -space-x-px">
                                    <button 
                                      onClick={() => updateEquipmentQuantity(location.id, eq.id, eq.quantity - 10)}
                                      className="w-7 h-7 flex items-center justify-center rounded-l-md bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 text-[10px] font-black transition-colors"
                                    >-10</button>
                                    <button 
                                      onClick={() => updateEquipmentQuantity(location.id, eq.id, eq.quantity - 1)}
                                      className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 text-xs font-black transition-colors border-l-0"
                                    >-</button>
                                  </div>
                                  
                                  <div className="flex flex-col items-center px-3 min-w-[50px]">
                                    <span className="text-base font-black text-indigo-700 leading-none">{eq.quantity}</span>
                                    <span className="text-[8px] text-gray-400 uppercase font-black mt-1">ADET</span>
                                  </div>
                                  
                                  <div className="flex items-center -space-x-px">
                                    <button 
                                      onClick={() => updateEquipmentQuantity(location.id, eq.id, eq.quantity + 1)}
                                      className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 text-xs font-black transition-colors border-r-0"
                                    >+</button>
                                    <button 
                                      onClick={() => updateEquipmentQuantity(location.id, eq.id, eq.quantity + 10)}
                                      className="w-7 h-7 flex items-center justify-center rounded-r-md bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 text-[10px] font-black transition-colors"
                                    >+10</button>
                                  </div>
                                </div>

                                <button
                                  onClick={() => updateEquipmentQuantity(location.id, eq.id, 0)}
                                  className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Cihazı Sil"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
