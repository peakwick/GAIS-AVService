import React, { useState, useEffect } from 'react';
import { AVConfigurator as Configurator } from './components/av/AVConfigurator';
import { AVAdminPanel as AdminPanel } from './components/av/AVAdminPanel';
import { AVOfferPreview as OfferPreview } from './components/av/AVOfferPreview';
import { AVServicePackages as ServicePackages } from './components/av/AVServicePackages';
import { AVCalculationModal as CalculationModal } from './components/av/AVCalculationModal';
import { AdminSettings, ConfigState, ServiceType } from './types';
import { DEFAULT_ADMIN_SETTINGS, DEFAULT_CONFIG_STATE, SERVICE_TYPES } from './constants/avConstants';
import { Settings, Sliders, FileText, LayoutDashboard, Package, Layers, ShieldCheck, Cpu, Wifi, Wrench, Zap, Video, Percent } from 'lucide-react';

type Tab = 'packages' | 'admin';

export default function App() {
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ConfigState | null>(null);
  
  // Load admin settings from local storage or use defaults
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('av_admin_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Migration logic for older versions
        if (!parsed.catalog) {
          parsed.catalog = [...DEFAULT_ADMIN_SETTINGS.catalog];
          
          // Migrate old servicePool
          if (parsed.servicePool) {
            parsed.servicePool.forEach((s: string) => {
              if (!parsed.catalog.find((c: any) => c.name === s)) {
                parsed.catalog.push({
                  id: `srv_migrated_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                  type: 'service',
                  name: s,
                  description: '',
                  costType: 'free',
                  costValue: 0,
                  icon: 'tool'
                });
              }
            });
          }
          
          // Migrate old timeEstimatesHours
          if (parsed.timeEstimatesHours) {
            Object.entries(parsed.timeEstimatesHours).forEach(([key, val]) => {
              const eqId = `eq_${key.toLowerCase()}`;
              const existing = parsed.catalog.find((c: any) => c.id === eqId || (c.id === 'eq_vc' && key === 'VideoConferencing'));
              if (existing) {
                existing.costValue = val as number;
              }
            });
          }
        }

        // Merge with defaults to ensure new properties exist
        return { 
          ...DEFAULT_ADMIN_SETTINGS, 
          ...parsed,
          servicePackages: parsed.servicePackages || DEFAULT_ADMIN_SETTINGS.servicePackages,
          catalog: parsed.catalog || DEFAULT_ADMIN_SETTINGS.catalog
        };
      } catch (e) {
        return DEFAULT_ADMIN_SETTINGS;
      }
    }
    return DEFAULT_ADMIN_SETTINGS;
  });

  // Save admin settings to local storage when they change
  useEffect(() => {
    localStorage.setItem('av_admin_settings', JSON.stringify(adminSettings));
  }, [adminSettings]);

  const [configState, setConfigState] = useState<ConfigState>(DEFAULT_CONFIG_STATE);

  const openCalcModal = (config?: ConfigState) => {
    setModalConfig(config || configState);
    setIsCalcModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row font-sans text-gray-900">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 print:hidden flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-indigo-600">
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-lg font-bold tracking-tight">Vibe Service Hub</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-3">Hizmet Alanı</p>
            <div className="space-y-1">
              {SERVICE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setConfigState({ ...configState, selectedServiceType: type as ServiceType });
                    setShowSystemSettings(false); // Reset settings view on module change
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    configState.selectedServiceType === type 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {type.includes('AV') && <Video className={`w-4 h-4 ${configState.selectedServiceType === type ? 'text-white' : 'text-indigo-400'}`} />}
                  {type.includes('Zebra') && <Zap className={`w-4 h-4 ${configState.selectedServiceType === type ? 'text-white' : 'text-amber-500'}`} />}
                  {type.includes('IT') && <Cpu className={`w-4 h-4 ${configState.selectedServiceType === type ? 'text-white' : 'text-blue-500'}`} />}
                  <span className="truncate">{type}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
            <p className="text-xs font-bold opacity-80 mb-1">PROTOTİP SÜRÜMÜ</p>
            <p className="text-[10px] leading-relaxed opacity-90">
              Bu sürüm kavram kanıtlama (PoC) amaçlıdır. Veriler yerel tarayıcıda saklanır.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto print:p-0 print:overflow-visible bg-gray-50/30">
        <div className="max-w-7xl mx-auto">
          {/* Module Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <nav className="flex items-center space-x-2 text-xs font-medium text-gray-400 mb-2">
                <span>Modüller</span>
                <span>/</span>
                <span className="text-gray-600">{configState.selectedServiceType}</span>
              </nav>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{configState.selectedServiceType}</h1>
            </div>
            
            <button
              onClick={() => setShowSystemSettings(!showSystemSettings)}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all border ${
                showSystemSettings 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-lg' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm'
              }`}
            >
              <Settings className={`w-4 h-4 ${showSystemSettings ? 'animate-spin-slow' : ''}`} />
              <span>{showSystemSettings ? 'Görünüme Dön' : 'Modül Ayarları'}</span>
            </button>
          </div>

          {showSystemSettings ? (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              {configState.selectedServiceType === 'AV Yıllık Bakım Hizmeti' ? (
                <AdminPanel settings={adminSettings} onChange={setAdminSettings} />
              ) : (
                <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                    <Settings className="w-8 h-8 text-gray-300 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ayarlar Modülü Hazırlanıyor</h3>
                  <p className="text-gray-500 max-w-sm">
                    {configState.selectedServiceType} için özel çarpanlar, birim maliyetler ve katalog yönetimi yakında burada olacak.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {configState.selectedServiceType === 'AV Yıllık Bakım Hizmeti' ? (
                <div className="space-y-16 animate-in fade-in duration-500">
                  <Configurator config={configState} adminSettings={adminSettings} onChange={setConfigState} />
                  
                  <div className="border-t border-gray-200 pt-16">
                    <ServicePackages 
                      config={configState} 
                      adminSettings={adminSettings} 
                      onChange={setConfigState} 
                      onAdminChange={setAdminSettings}
                      onShowBreakdown={openCalcModal}
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-16">
                    <OfferPreview 
                      config={configState} 
                      admin={adminSettings} 
                      onChangeConfig={setConfigState} 
                      onAdminChange={setAdminSettings}
                      onShowBreakdown={() => openCalcModal()}
                    />
                  </div>
                </div>
              ) : (
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 shadow-sm animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8 rotate-3">
                    <Wrench className="w-12 h-12 text-indigo-500 animate-pulse" />
                  </div>
                  <h2 className="text-4xl font-black text-gray-900 mb-4">{configState.selectedServiceType}</h2>
                  <div className="max-w-md">
                    <p className="text-xl text-gray-500 mb-10 leading-relaxed">
                      Bu modül şu anda geliştirme aşamasındadır. Yakında burada kendi özel ayarları ve hesaplama motoruyla hizmet verecektir.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <span className="flex items-center space-x-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-2xl text-sm font-bold border border-gray-200 shadow-sm">
                        <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                        <span>Özel Katalog</span>
                      </span>
                      <span className="flex items-center space-x-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-2xl text-sm font-bold border border-gray-200 shadow-sm">
                        <Percent className="w-4 h-4 text-amber-500" />
                        <span>Benzersiz Çarpanlar</span>
                      </span>
                      <span className="flex items-center space-x-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-2xl text-sm font-bold border border-gray-200 shadow-sm">
                        <Wifi className="w-4 h-4 text-blue-500" />
                        <span>Dinamik Hesaplama</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Calculation Modal */}
      {modalConfig && (
        <CalculationModal
          isOpen={isCalcModalOpen}
          onClose={() => setIsCalcModalOpen(false)}
          config={modalConfig}
          admin={adminSettings}
        />
      )}
    </div>
  );
}
