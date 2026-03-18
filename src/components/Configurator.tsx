import React from 'react';
import { ConfigState, Room, Equipment, AdminSettings, ProjectLocation } from '../types';
import { LOCATIONS, BILLING_CYCLES } from '../constants';
import { Plus, Trash2, Monitor, Mic, Video, Settings, Speaker, Box, Wrench, MapPin } from 'lucide-react';

interface ConfiguratorProps {
  config: ConfigState;
  adminSettings: AdminSettings;
  onChange: (config: ConfigState) => void;
}

const getIconForType = (iconName?: string) => {
  switch (iconName) {
    case 'monitor': return <Monitor className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    case 'mic': return <Mic className="w-4 h-4" />;
    case 'settings': return <Settings className="w-4 h-4" />;
    case 'box': return <Box className="w-4 h-4" />;
    case 'speaker': return <Speaker className="w-4 h-4" />;
    case 'tool': return <Wrench className="w-4 h-4" />;
    default: return <Speaker className="w-4 h-4" />;
  }
};

export function Configurator({ config, adminSettings, onChange }: ConfiguratorProps) {
  const updateField = (field: keyof ConfigState, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const equipmentCatalog = adminSettings.catalog?.filter(c => c.type === 'equipment') || [];

  const addLocation = () => {
    const newLocation: ProjectLocation = {
      id: crypto.randomUUID(),
      name: `Konum ${config.locations.length + 1}`,
      city: LOCATIONS[0],
      rooms: []
    };
    updateField('locations', [...config.locations, newLocation]);
  };

  const removeLocation = (locId: string) => {
    updateField('locations', config.locations.filter(l => l.id !== locId));
  };

  const updateLocation = (locId: string, field: keyof ProjectLocation, value: any) => {
    updateField('locations', config.locations.map(l => l.id === locId ? { ...l, [field]: value } : l));
  };

  const addRoom = (locId: string) => {
    const defaultEquipment = equipmentCatalog
      .filter(item => item.isDefaultRoomEquipment)
      .map(item => ({
        id: crypto.randomUUID(),
        catalogId: item.id,
        quantity: 1
      }));

    updateField('locations', config.locations.map(l => {
      if (l.id === locId) {
        const newRoom: Room = {
          id: crypto.randomUUID(),
          name: `Oda ${l.rooms.length + 1}`,
          equipment: defaultEquipment
        };
        return { ...l, rooms: [...l.rooms, newRoom] };
      }
      return l;
    }));
  };

  const removeRoom = (locId: string, roomId: string) => {
    updateField('locations', config.locations.map(l => {
      if (l.id === locId) {
        return { ...l, rooms: l.rooms.filter(r => r.id !== roomId) };
      }
      return l;
    }));
  };

  const updateRoomName = (locId: string, roomId: string, name: string) => {
    updateField('locations', config.locations.map(l => {
      if (l.id === locId) {
        return { ...l, rooms: l.rooms.map(r => r.id === roomId ? { ...r, name } : r) };
      }
      return l;
    }));
  };

  const addEquipment = (locId: string, roomId: string, catalogId: string) => {
    updateField('locations', config.locations.map(l => {
      if (l.id === locId) {
        return {
          ...l,
          rooms: l.rooms.map(r => {
            if (r.id === roomId) {
              const existing = r.equipment.find(e => e.catalogId === catalogId);
              if (existing) {
                return {
                  ...r,
                  equipment: r.equipment.map(e => e.catalogId === catalogId ? { ...e, quantity: e.quantity + 1 } : e)
                };
              }
              return {
                ...r,
                equipment: [...r.equipment, { id: crypto.randomUUID(), catalogId, quantity: 1 }]
              };
            }
            return r;
          })
        };
      }
      return l;
    }));
  };

  const updateEquipmentQuantity = (locId: string, roomId: string, eqId: string, quantity: number) => {
    updateField('locations', config.locations.map(l => {
      if (l.id === locId) {
        return {
          ...l,
          rooms: l.rooms.map(r => {
            if (r.id === roomId) {
              if (quantity < 1) {
                return { ...r, equipment: r.equipment.filter(e => e.id !== eqId) };
              }
              return {
                ...r,
                equipment: r.equipment.map(e => e.id === eqId ? { ...e, quantity } : e)
              };
            }
            return r;
          })
        };
      }
      return l;
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Proje Yapılandırması</h2>
        <p className="text-gray-500 mt-1">Müşteri detaylarını, konumları, odaları ve ekipmanları belirleyin.</p>
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
                  placeholder="örn. ABC A.Ş."
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proje Adı</label>
                <input
                  type="text"
                  value={config.projectName}
                  onChange={(e) => updateField('projectName', e.target.value)}
                  placeholder="örn. Merkez Ofis AV Bakım"
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
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

        {/* Right Column: Locations & Rooms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Konumlar ve Odalar</h3>
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
              {config.locations.map((location, locIndex) => (
                <div key={location.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={location.name}
                        onChange={(e) => updateLocation(location.id, 'name', e.target.value)}
                        className="bg-transparent border-none p-0 focus:ring-0 text-base font-semibold text-gray-900 w-1/3 outline-none"
                        placeholder="Konum Adı"
                      />
                      <select
                        value={location.city}
                        onChange={(e) => updateLocation(location.id, 'city', e.target.value)}
                        className="rounded-md border-gray-300 border p-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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
                      <h4 className="text-sm font-medium text-gray-700">Odalar</h4>
                      <button
                        onClick={() => addRoom(location.id)}
                        className="flex items-center space-x-1 text-xs bg-white border border-gray-300 text-gray-700 px-2.5 py-1.5 rounded-md hover:bg-gray-50 transition-colors font-medium"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Oda Ekle</span>
                      </button>
                    </div>

                    {location.rooms.length === 0 ? (
                      <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-200">
                        <p className="text-sm text-gray-400">Bu konuma henüz oda eklenmedi.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {location.rooms.map((room, roomIndex) => (
                          <div key={room.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                              <div className="flex items-center space-x-2 flex-1">
                                <span className="text-xs font-medium text-gray-400 w-5">{roomIndex + 1}.</span>
                                <input
                                  type="text"
                                  value={room.name}
                                  onChange={(e) => updateRoomName(location.id, room.id, e.target.value)}
                                  className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-gray-900 w-full outline-none"
                                  placeholder="Oda Adı"
                                />
                              </div>
                              <button
                                onClick={() => removeRoom(location.id, room.id)}
                                className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors"
                                title="Odayı Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="p-3">
                              {room.equipment.length > 0 && (
                                <div className="mb-3 space-y-1.5">
                                  {room.equipment.map(eq => {
                                    const catalogItem = equipmentCatalog.find(c => c.id === eq.catalogId);
                                    return (
                                      <div key={eq.id} className="flex items-center justify-between bg-gray-50 p-1.5 rounded-md border border-gray-100">
                                        <div className="flex items-center space-x-2">
                                          <div className="p-1 bg-white rounded text-indigo-600 shadow-sm">
                                            {getIconForType(catalogItem?.icon)}
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-xs font-medium text-gray-700">{catalogItem?.name || 'Bilinmeyen Ekipman'}</span>
                                            {catalogItem?.description && (
                                              <span className="text-[10px] text-gray-500">{catalogItem.description}</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <button 
                                            onClick={() => updateEquipmentQuantity(location.id, room.id, eq.id, eq.quantity - 1)}
                                            className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs"
                                          >-</button>
                                          <span className="text-xs font-medium w-5 text-center">{eq.quantity}</span>
                                          <button 
                                            onClick={() => updateEquipmentQuantity(location.id, room.id, eq.id, eq.quantity + 1)}
                                            className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs"
                                          >+</button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              <div className="flex flex-wrap gap-1.5">
                                {equipmentCatalog.filter(item => !room.equipment.some(eq => eq.catalogId === item.id)).map(item => (
                                  <button
                                    key={item.id}
                                    onClick={() => addEquipment(location.id, room.id, item.id)}
                                    className="flex items-center space-x-1 text-[11px] border border-gray-200 bg-white text-gray-600 px-2 py-1 rounded hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>{item.name.split(' / ')[0]}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
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
