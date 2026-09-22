import React, { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { Sidebar } from '../components/ui/Sidebar';
import { MarketAlert } from '../components/ui/MarketAlert';
import { useTranslation } from '../context/LanguageContext';
import { DEMO_SUPPLY_DEMAND } from '../data/mockData';
import { analyzeAllCrops, analyzeDemand, getCropSnapshot } from '../services/demandEngine';
import { ArrowLeft } from 'lucide-react';

interface AdminSupplyDemandPageProps {
  onNavigate: (route: string) => void;
}

export const AdminSupplyDemandPage: React.FC<AdminSupplyDemandPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  const analyses = useMemo(() => analyzeAllCrops(), []);
  const tomato = useMemo(() => analyzeDemand({ crop: 'Tomato' }), []);
  const tomatoSnap = getCropSnapshot('Tomato');

  const maxValue = useMemo(() => {
    return Math.max(...analyses.flatMap((a) => [a.supply, a.demand]), 1);
  }, [analyses]);

  const statusLabel = (status: string) => {
    if (status === 'HIGH_DEMAND') return t('phase3.statusHighDemand');
    if (status === 'SURPLUS') return t('phase3.statusSurplus');
    return t('phase3.statusBalanced');
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#F8FAF8] text-slate-800">
      <Sidebar currentRoute="admin-supply-demand" onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 max-w-6xl mx-auto space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => onNavigate('admin-dashboard')}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('common.back')}
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('phase3.adminSupplyDemandTitle')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{t('phase3.adminSupplyDemandSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full border border-slate-300">
              {t('phase3.demoDataBadge')}
            </span>
            <LanguageSelector variant="compact" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analyses.map((a) => (
            <Card key={a.crop} className="p-5 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900">{a.crop}</h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    a.status === 'HIGH_DEMAND'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : a.status === 'SURPLUS'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {statusLabel(a.status)}
                </span>
              </div>
              <div className="text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>{t('phase3.supply')}</span>
                  <strong>
                    {a.supply.toLocaleString('en-IN')} {t('common.kg')}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>{t('phase3.demand')}</span>
                  <strong>
                    {a.demand.toLocaleString('en-IN')} {t('common.kg')}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>{t('phase3.gap')}</span>
                  <strong className="text-slate-900">
                    {a.gap > 0 ? '+' : ''}
                    {a.gap.toLocaleString('en-IN')} {t('common.kg')}
                  </strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{a.upcomingHarvestRisk}</p>
            </Card>
          ))}
        </div>

        <Card className="p-5 sm:p-6 border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">{t('phase3.supplyVsDemandViz')}</h3>
          <div className="space-y-4">
            {analyses.map((a) => (
              <div key={`viz-${a.crop}`} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{a.crop}</span>
                  <span className="text-slate-500 font-medium">{statusLabel(a.status)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-16 text-slate-500 shrink-0">{t('phase3.supply')}</span>
                    <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-500"
                        style={{ width: `${(a.supply / maxValue) * 100}%` }}
                      />
                    </div>
                    <span className="w-20 text-right font-semibold text-slate-700">
                      {a.supply.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-16 text-slate-500 shrink-0">{t('phase3.demand')}</span>
                    <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-700"
                        style={{ width: `${(a.demand / maxValue) * 100}%` }}
                      />
                    </div>
                    <span className="w-20 text-right font-semibold text-slate-700">
                      {a.demand.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">{t('phase3.illustrativeNote')}</p>
        </Card>

        <MarketAlert
          analysis={tomato}
          upcomingSupplyKg={tomatoSnap?.upcomingHarvestKg ?? DEMO_SUPPLY_DEMAND[0].upcomingHarvestKg}
        />
      </main>
    </div>
  );
};
