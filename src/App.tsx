import React, { useState, useEffect } from 'react';
import { Configurator } from './components/Configurator';
import { AdminPanel } from './components/AdminPanel';
import { OfferPreview } from './components/OfferPreview';
import { ServicePackages } from './components/ServicePackages';
import { CalculationModal } from './components/CalculationModal';
import { AdminSettings, ConfigState } from './types';
import { DEFAULT_ADMIN_SETTINGS, DEFAULT_CONFIG_STATE } from './constants';
import { Settings, Sliders, FileText, LayoutDashboard, Package } from 'lucide-react';

type Tab = 'packages' | 'admin';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('packages');
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
      
      {/* Sidebar Navigation (Hidden when printing) */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 print:hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-indigo-600">
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-lg font-bold tracking-tight">AV Konfigüratör</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          <button
            onClick={() => setActiveTab('packages')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'packages' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Hizmet Paketleri</span>
          </button>

          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'admin' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Yönetici Ayarları</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto print:p-0 print:overflow-visible">
        {activeTab === 'packages' && (
          <div className="space-y-16">
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
        )}
        {activeTab === 'admin' && (
          <AdminPanel settings={adminSettings} onChange={setAdminSettings} />
        )}
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
