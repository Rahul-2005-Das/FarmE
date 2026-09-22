import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { useTranslation } from '../context/LanguageContext';
import { LogisticsPlan } from '../types';
import { generateLogisticsPlan } from '../services/logisticsEngine';
import { loadCurrentLogisticsPlan, saveLogisticsPlan } from '../services/storage';

interface Props { onNavigate: (route: string) => void; }

export const AdminLogisticsPage: React.FC<Props> = () => {
  const { t } = useTranslation();
  const [plan] = useState<LogisticsPlan>(() => loadCurrentLogisticsPlan() ?? generateLogisticsPlan());
  useEffect(() => { saveLogisticsPlan(plan); }, [plan]);
  const metrics = [[t('phase4.coordinatedProduce'), '2,450 kg'], [t('phase4.farmerGroups'), '8'], [t('phase4.vehicleUtilization'), '78%'], [t('phase4.distanceReduced'), '126 km'], [t('phase4.activeShipments'), '6'], [t('phase4.routeEfficiency'), `${plan.route.routeScore}%`]];
  return <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 text-left pb-24"><div className="flex justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-200 px-3 py-1 rounded-full">{t('phase4.demoData')}</span><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{t('phase4.adminLogistics')}</h1><p className="text-xs text-slate-500 mt-1">{t('phase4.logisticsPrototype')}</p></div><LanguageSelector variant="compact" /></div><div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{metrics.map(([label, value]) => <Card key={label} className="p-5 border border-slate-200"><p className="text-xs text-slate-500">{label}</p><strong className="text-2xl text-slate-900 mt-2 block">{value}</strong></Card>)}</div><Card className="p-5 border border-slate-200 space-y-3"><h2 className="font-extrabold text-slate-900">{t('phase4.collectionUsage')}</h2><div className="flex justify-between text-sm"><span>{plan.collectionPoint.name}</span><strong>{plan.collectionPoint.suitabilityScore}%</strong></div><div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-700" style={{ width: `${plan.collectionPoint.suitabilityScore}%` }} /></div><p className="text-xs text-slate-500">{t('phase4.bottlenecks')}: Review harvest timing before confirming larger groups.</p></Card><Card className="p-5 border border-emerald-200 bg-emerald-50/60"><h2 className="font-extrabold text-emerald-950">{t('phase4.aiRecommendation')}</h2><p className="text-sm text-emerald-900 mt-2">{t('phase4.recommendation')}</p></Card></div>;
};
