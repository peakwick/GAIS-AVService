import React, { useState, useEffect } from 'react';
// AV Components
import { AVConfigurator } from './components/av/AVConfigurator';
import { AVAdminPanel } from './components/av/AVAdminPanel';
import { AVOfferPreview } from './components/av/AVOfferPreview';
import { AVServicePackages } from './components/av/AVServicePackages';
import { AVCalculationModal } from './components/av/AVCalculationModal';
// Zebra Components
import { ZebraConfigurator } from './components/zebra/ZebraConfigurator';
import { ZebraAdminPanel } from './components/zebra/ZebraAdminPanel';
import { ZebraOfferPreview } from './components/zebra/ZebraOfferPreview';
import { ZebraServicePackages } from './components/zebra/ZebraServicePackages';
import { ZebraCalculationModal } from './components/zebra/ZebraCalculationModal';

import { AdminSettings, ConfigState, ServiceType, GeneralSettings } from './types';
import { DEFAULT_ADMIN_SETTINGS as AV_DEFAULTS, DEFAULT_CONFIG_STATE as AV_CONFIG_DEFAULTS, SERVICE_TYPES } from './constants/avConstants';
import { DEFAULT_ZEBRA_ADMIN_SETTINGS as ZEBRA_DEFAULTS, DEFAULT_ZEBRA_CONFIG_STATE as ZEBRA_CONFIG_DEFAULTS } from './constants/zebraConstants';
import { DEFAULT_GENERAL_SETTINGS } from './constants/generalConstants';
import { Settings, LayoutDashboard, Zap, Video, Cpu, Wrench, Percent, Wifi, Globe } from 'lucide-react';
import { GeneralAdminPanel } from './components/GeneralAdminPanel.tsx';

export default function App() {
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ConfigState | null>(null);
  
  // 1. Service Type State
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>(() => {
    const saved = localStorage.getItem('last_selected_service_type');
    return (saved as ServiceType) || SERVICE_TYPES[0];
  });

  useEffect(() => {
    localStorage.setItem('last_selected_service_type', selectedServiceType);
  }, [selectedServiceType]);

  // 1.5 General Settings
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(() => {
    const saved = localStorage.getItem('gais_general_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_GENERAL_SETTINGS, ...parsed };
      } catch (e) { return DEFAULT_GENERAL_SETTINGS; }
    }
    return DEFAULT_GENERAL_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('gais_general_settings', JSON.stringify(generalSettings));
  }, [generalSettings]);

  // 2. AV Admin Settings
  const [avAdminSettings, setAvAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('av_admin_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...AV_DEFAULTS, ...parsed };
      } catch (e) { return AV_DEFAULTS; }
    }
    return AV_DEFAULTS;
  });

  useEffect(() => {
    localStorage.setItem('av_admin_settings', JSON.stringify(avAdminSettings));
  }, [avAdminSettings]);

  // 3. Zebra Admin Settings
  const [zebraAdminSettings, setZebraAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('zebra_admin_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...ZEBRA_DEFAULTS, ...parsed };
      } catch (e) { return ZEBRA_DEFAULTS; }
    }
    return ZEBRA_DEFAULTS;
  });

  useEffect(() => {
    localStorage.setItem('zebra_admin_settings', JSON.stringify(zebraAdminSettings));
  }, [zebraAdminSettings]);

  // 4. Config States (User Project Data)
  const [avConfig, setAvConfig] = useState<ConfigState>(() => {
    const saved = localStorage.getItem('av_config_state');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return { ...AV_CONFIG_DEFAULTS, ...parsed };
      } catch (e) { return AV_CONFIG_DEFAULTS; }
    }
    return AV_CONFIG_DEFAULTS;
  });

  useEffect(() => {
    localStorage.setItem('av_config_state', JSON.stringify(avConfig));
  }, [avConfig]);

  const [zebraConfig, setZebraConfig] = useState<ConfigState>(() => {
    const saved = localStorage.getItem('zebra_config_state');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return { ...ZEBRA_CONFIG_DEFAULTS, ...parsed };
      } catch (e) { return ZEBRA_CONFIG_DEFAULTS; }
    }
    return ZEBRA_CONFIG_DEFAULTS;
  });

  useEffect(() => {
    localStorage.setItem('zebra_config_state', JSON.stringify(zebraConfig));
  }, [zebraConfig]);

  // Helpers to get current active states
  const isAVMaintenance = selectedServiceType === 'AV Yıllık Bakım Hizmeti';
  const isZebraMaintenance = selectedServiceType === 'Zebra Yıllık Bakım';

  const currentAdmin = isAVMaintenance ? avAdminSettings : (isZebraMaintenance ? zebraAdminSettings : avAdminSettings);
  const currentConfig = isAVMaintenance ? avConfig : (isZebraMaintenance ? zebraConfig : avConfig);
  
  const openCalcModal = (config?: ConfigState) => {
    setModalConfig(config || currentConfig);
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
                    setSelectedServiceType(type as ServiceType);
                    setShowSystemSettings(false);
                    setShowGeneralSettings(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    selectedServiceType === type && !showGeneralSettings 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {type.includes('AV') && <Video className={`w-4 h-4 ${selectedServiceType === type ? 'text-white' : 'text-indigo-400'}`} />}
                  {type.includes('Zebra') && <Zap className={`w-4 h-4 ${selectedServiceType === type ? 'text-white' : 'text-amber-500'}`} />}
                  {type.includes('IT') && <Cpu className={`w-4 h-4 ${selectedServiceType === type ? 'text-white' : 'text-blue-500'}`} />}
                  <span className="truncate">{type}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-3">Sistem</p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setShowGeneralSettings(true);
                  setShowSystemSettings(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  showGeneralSettings 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Globe className={`w-4 h-4 ${showGeneralSettings ? 'text-white' : 'text-emerald-500'}`} />
                <span>Genel Ayarlar</span>
              </button>
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
                <span>{showGeneralSettings ? 'Sistem' : 'Modüller'}</span>
                <span>/</span>
                <span className="text-gray-600">{showGeneralSettings ? 'Genel Ayarlar' : selectedServiceType}</span>
              </nav>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                {showGeneralSettings ? 'Genel Sistem Ayarları' : selectedServiceType}
              </h1>
            </div>
            
            {!showGeneralSettings && (
              <button
                onClick={() => {
                  setShowSystemSettings(!showSystemSettings);
                  setShowGeneralSettings(false);
                }}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all border ${
                  showSystemSettings 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm'
                }`}
              >
                <Settings className={`w-4 h-4 ${showSystemSettings ? 'animate-spin-slow' : ''}`} />
                <span>{showSystemSettings ? 'Görünüme Dön' : 'Modül Ayarları'}</span>
              </button>
            )}
          </div>

          {showGeneralSettings ? (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <GeneralAdminPanel settings={generalSettings} onChange={setGeneralSettings} />
            </div>
          ) : showSystemSettings ? (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              {isAVMaintenance && <AVAdminPanel settings={avAdminSettings} generalSettings={generalSettings} onChange={setAvAdminSettings} />}
              {isZebraMaintenance && <ZebraAdminPanel settings={zebraAdminSettings} generalSettings={generalSettings} onChange={setZebraAdminSettings} />}
              {!isAVMaintenance && !isZebraMaintenance && (
                <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                    <Settings className="w-8 h-8 text-gray-300 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ayarlar Modülü Hazırlanıyor</h3>
                  <p className="text-gray-500 max-w-sm">{selectedServiceType} için ayarlar yakında burada olacak.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {isAVMaintenance && (
                <div className="space-y-16 animate-in fade-in duration-500">
                  <AVConfigurator config={avConfig} adminSettings={avAdminSettings} generalSettings={generalSettings} onChange={setAvConfig} />
                  <div className="border-t border-gray-200 pt-16">
                    <AVServicePackages config={avConfig} adminSettings={avAdminSettings} generalSettings={generalSettings} onChange={setAvConfig} onAdminChange={setAvAdminSettings} onShowBreakdown={openCalcModal} />
                  </div>
                  <div className="border-t border-gray-200 pt-16">
                    <AVOfferPreview config={avConfig} admin={avAdminSettings} generalSettings={generalSettings} onChangeConfig={setAvConfig} onAdminChange={setAvAdminSettings} onShowBreakdown={() => openCalcModal()} />
                  </div>
                </div>
              )}
              {isZebraMaintenance && (
                <div className="space-y-16 animate-in fade-in duration-500">
                  <ZebraConfigurator config={zebraConfig} adminSettings={zebraAdminSettings} generalSettings={generalSettings} onChange={setZebraConfig} />
                  <div className="border-t border-gray-200 pt-16">
                    <ZebraServicePackages config={zebraConfig} adminSettings={zebraAdminSettings} generalSettings={generalSettings} onChange={setZebraConfig} onAdminChange={setZebraAdminSettings} onGeneralChange={setGeneralSettings} onShowBreakdown={openCalcModal} />
                  </div>
                  <div className="border-t border-gray-200 pt-16">
                    <ZebraOfferPreview config={zebraConfig} admin={zebraAdminSettings} generalSettings={generalSettings} onChangeConfig={setZebraConfig} onAdminChange={setZebraAdminSettings} onGeneralChange={setGeneralSettings} onShowBreakdown={() => openCalcModal()} />
                  </div>
                </div>
              )}
              {!isAVMaintenance && !isZebraMaintenance && (
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 shadow-sm animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8 rotate-3">
                    <Wrench className="w-12 h-12 text-indigo-500 animate-pulse" />
                  </div>
                  <h2 className="text-4xl font-black text-gray-900 mb-4">{selectedServiceType}</h2>
                  <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-md">Bu modül şu anda geliştirme aşamasındadır.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Calculation Modals */}
      {isCalcModalOpen && modalConfig && isAVMaintenance && (
        <AVCalculationModal isOpen={isCalcModalOpen} onClose={() => setIsCalcModalOpen(false)} config={modalConfig} admin={avAdminSettings} general={generalSettings} />
      )}
      {isCalcModalOpen && modalConfig && isZebraMaintenance && (
        <ZebraCalculationModal isOpen={isCalcModalOpen} onClose={() => setIsCalcModalOpen(false)} config={modalConfig} admin={zebraAdminSettings} general={generalSettings} onGeneralChange={setGeneralSettings} />
      )}
    </div>
  );
}
