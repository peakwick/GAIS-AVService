import { AdminSettings, ConfigState, GeneralSettings } from '../../types';
import { calculateCosts } from '../../utils/avCalculations';
import { FileText, Download, Printer, Check, X, Calculator, Settings, Percent, Info, ChevronRight, Package, ShieldCheck, Layers } from 'lucide-react';
import { PriceDisplay } from '../PriceDisplay';

interface AVOfferPreviewProps {
  config: ConfigState;
  admin: AdminSettings;
  generalSettings: GeneralSettings;
  onChangeConfig: (config: ConfigState) => void;
  onAdminChange?: (settings: AdminSettings) => void;
  onGeneralChange?: (settings: GeneralSettings) => void;
  onShowBreakdown?: () => void;
}

export function AVOfferPreview({ config, admin, generalSettings, onChangeConfig, onAdminChange, onGeneralChange, onShowBreakdown }: AVOfferPreviewProps) {
  const costs = calculateCosts(config, admin, generalSettings);

  const handlePrint = () => {
    window.print();
  };

  const handleShowBreakdown = () => {
    if (onShowBreakdown) onShowBreakdown();
  };

  const selectedPackage = config.servicePackage !== 'custom' 
    ? (admin.servicePackages || []).find(p => p.id === config.servicePackage)
    : null;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Teklif Önizleme</h2>
          <p className="text-gray-500 mt-1">Hesaplanan maliyetleri inceleyin ve nihai teklifi oluşturun.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Yazdır / PDF</span>
          </button>
        </div>
      </div>

      {/* The Document */}
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hizmet Teklifi</h1>
            <p className="text-gray-500 mt-2">{config.projectName || 'Ses-Görüntü Bakım ve Destek'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Hazırlanan:</p>
            <p className="text-lg text-indigo-700 font-semibold mt-1">{config.clientName || 'Müşteri Adı'}</p>
            <p className="text-sm text-gray-500">{config.locations.map(l => l.city).join(', ') || 'Konum Belirtilmemiş'}</p>
            <p className="text-sm text-gray-500 mt-4">Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
          </div>
        </div>

        {/* Scope Summary */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hizmet Kapsamı</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Oda Sayısı</p>
              <p className="text-2xl font-light text-gray-900">
                {config.locations.reduce((sum, loc) => sum + loc.rooms.length, 0)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Ekipman Sayısı</p>
              <p className="text-2xl font-light text-gray-900">
                {config.locations.reduce((acc, loc) => acc + loc.rooms.reduce((sum, r) => sum + r.equipment.reduce((eqSum, e) => eqSum + e.quantity, 0), 0), 0)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Arıza Müdahale</p>
              <p className="text-2xl font-light text-gray-900">{config.incidentVisitsPerYear || 0} <span className="text-sm">/ yıl</span></p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Önleyici Bakım</p>
              <p className="text-2xl font-light text-gray-900">{config.proactiveVisitsPerYear || 0} <span className="text-sm">/ yıl</span></p>
            </div>
          </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-gray-100">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Başlangıç Tarihi</p>
              <p className="text-sm font-semibold text-gray-900">
                {config.contractStartDate ? new Date(config.contractStartDate).toLocaleDateString('tr-TR') : '-'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Bitiş Tarihi</p>
              <p className="text-sm font-semibold text-gray-900">
                {(() => {
                  if (!config.contractStartDate) return '-';
                  const d = new Date(config.contractStartDate);
                  d.setFullYear(d.getFullYear() + 1);
                  return d.toLocaleDateString('tr-TR');
                })()}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Fatura Dönemi</p>
              <p className="text-sm font-semibold text-gray-900">{config.billingCycle}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Teklif Nosu</p>
              <p className="text-sm font-mono font-bold text-indigo-600">OFFER-{new Date().getFullYear()}-{(Math.random() * 10000).toFixed(0).padStart(4, '0')}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Ekipman Envanter Özeti</h4>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ekipman Tipi</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Toplam Adet</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Açıklama</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {Array.from(new Set(config.locations.flatMap(l => l.rooms.flatMap(r => r.equipment.map(e => e.catalogId))))).map(catalogId => {
                    const item = admin.catalog?.find(c => c.id === catalogId);
                    const totalQty = config.locations.reduce((acc, loc) => 
                      acc + loc.rooms.reduce((roomAcc, room) => 
                        roomAcc + (room.equipment.filter(e => e.catalogId === catalogId).reduce((s, e) => s + e.quantity, 0))
                      , 0)
                    , 0);
                    if (!item) return null;
                    return (
                      <tr key={catalogId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">{totalQty}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{item.description || 'Hizmet dahilinde işçilik ve destek.'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>


          {/* Add-ons and Global Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Dahil Olan Hizmetler</h4>
              <div className="space-y-2">
                {/* Base included items always in any package */}
                {(admin.globalIncludedServices || []).map((f, i) => (
                  <div key={`base-${i}`} className="flex items-start space-x-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{f}</span>
                  </div>
                ))}
                {/* User-selected add-ons */}
                {(config.selectedAddons || []).map((addon, i) => {
                  const catalogItem = admin.catalog?.find(item => item.id === addon.id);
                  if (!catalogItem) return null;
                  return (
                    <div key={`addon-${i}`} className="flex items-start space-x-2 text-sm">
                      <Check className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                      <span className="text-gray-700 font-medium">
                        {catalogItem.name}
                        {addon.quantity > 1 && (
                          <span className="ml-1.5 text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                            x{addon.quantity}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
                {(config.selectedAddons || []).length === 0 && (
                  <span className="text-xs text-gray-400 italic">Ek hizmet seçilmedi.</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Kapsam Dışı Hizmetler</h4>
              <div className="space-y-2">
                {(admin.globalExcludedServices || []).map((item, i) => (
                  <div key={`excl-${i}`} className="flex items-start space-x-2 text-sm">
                    <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-gray-500">{item}</span>
                  </div>
                ))}
                {(!admin.globalExcludedServices || admin.globalExcludedServices.length === 0) && (
                  <span className="text-xs text-gray-400 italic">Belirtilmemiş</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yatırım Özeti</h3>
          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <p className="text-indigo-900 font-medium">Toplam Yıllık Yatırım</p>
                <p className="text-sm text-indigo-700/80 mt-1">Faturalandırma Planı: {config.billingCycle}</p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-4xl font-bold text-indigo-700">
                  <PriceDisplay amount={costs.annualPrice} adminSettings={admin} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} />
                </p>
                {config.billingCycle !== 'Yıllık' && (
                  <p className="text-sm text-indigo-700/80 mt-1 font-medium">
                    (Seçilen Plan: <PriceDisplay amount={costs.periodicPrice} adminSettings={admin} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /> / {config.billingCycle === 'Aylık' ? 'Ay' : 'Çeyrek'})
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Internal Breakdown (Hidden in print) */}
          <div 
            className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 print:hidden group/breakdown hover:bg-gray-100 transition-colors cursor-help relative"
            onClick={handleShowBreakdown}
            title="Hesaplama detaylarını görmek için tıklayın"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">İç Maliyet Dağılımı (Yazdırılmaz)</p>
              <Calculator className="w-4 h-4 text-indigo-500 opacity-0 group-hover/breakdown:opacity-100 transition-opacity" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Tahmini Saat/Yıl:</span>
                <span className="font-medium">{costs.totalAnnualHours.toFixed(1)} sa</span>
              </div>
              <div>
                <span className="text-gray-500 block">Lojistik Maliyeti:</span>
                <span className="font-medium"><PriceDisplay amount={costs.breakdown.totalLogisticsCost || 0} adminSettings={admin} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
              </div>
              <div>
                <span className="text-gray-500 block">Temel Maliyet:</span>
                <span className="font-medium"><PriceDisplay amount={costs.annualBaseCost} adminSettings={admin} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
              </div>
              <div>
                <span className="text-gray-500 block">Kar Marjı:</span>
                <span className="font-medium">{admin.markupPercentage}%</span>
              </div>
              <div>
                <span className="text-gray-500 block">Kar:</span>
                <span className="font-medium text-emerald-600"><PriceDisplay amount={costs.annualPrice - costs.annualBaseCost} adminSettings={admin} generalSettings={generalSettings} onAdminChange={onAdminChange} onGeneralChange={onGeneralChange} /></span>
              </div>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Şartlar ve Koşullar</h3>
            <button
              onClick={() => {
                if (window.confirm('Şartlar ve koşulları yönetici ayarlarındaki varsayılan metne sıfırlamak istediğinize emin misiniz?')) {
                  onChangeConfig({ ...config, customConditions: admin.defaultCustomConditions });
                }
              }}
              className="text-xs flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors print:hidden"
            >
              <Settings className="w-3 h-3" />
              <span>Varsayılana Sıfırla</span>
            </button>
          </div>
          <div className="print:hidden">
            <textarea
              value={config.customConditions}
              onChange={(e) => onChangeConfig({ ...config, customConditions: e.target.value })}
              className="w-full h-48 rounded-xl border-gray-300 border p-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-700 leading-relaxed"
              placeholder="Şartlar ve koşulları buraya girin..."
            />
          </div>
          <div className="hidden print:block text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {config.customConditions}
          </div>
        </div>

      </div>
    </div>
  );
}
