import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { useTranslation } from '../context/LanguageContext';
import { EmergencyCase } from '../types';
import { calculateFarmerRecoveryImpact, generateEmergencyMarketPlan } from '../services/emergencyEngine';
import { loadCurrentEmergencyCase, saveEmergencyCase } from '../services/storage';

interface Props { onNavigate: (route: string) => void; }

export const AdminEmergencyPage: React.FC<Props> = () => {
  const { t } = useTranslation();
  const [emergencyCase] = useState<EmergencyCase>(() => loadCurrentEmergencyCase() ?? generateEmergencyMarketPlan());
  useEffect(() => { saveEmergencyCase(emergencyCase); }, [emergencyCase]);
  const impact = calculateFarmerRecoveryImpact(emergencyCase);
  const metrics = [[t('phase5.activeCases'), '4'], [t('phase5.atRiskQuantity'), '1,240 kg'], [t('phase5.recoveryRate'), '74%'], [t('phase5.availableBuyers'), '12'], [t('phase5.criticalCases'), '2'], [t('phase5.recoveredQuantity'), `${impact.recoveredQuantityKg} kg`]];
  return <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 text-left pb-24"><div className="flex items-start justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-200 px-3 py-1 rounded-full">{t('phase5.demoLabel')}</span><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{t('phase5.adminEmergency')}</h1></div><LanguageSelector variant="compact" /></div><div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{metrics.map(([label, value]) => <Card key={label} className="p-5 border border-slate-200"><p className="text-xs text-slate-500">{label}</p><strong className="text-2xl text-slate-900 mt-2 block">{value}</strong></Card>)}</div><Card className="p-5 border border-slate-200 space-y-4"><div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-rose-700" /><h2 className="font-extrabold text-slate-900">Recovery Cases</h2></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="py-2 pr-3">Farmer</th><th className="py-2 pr-3">Crop</th><th className="py-2 pr-3">At Risk</th><th className="py-2 pr-3">Risk</th><th className="py-2 pr-3">Alternative Buyer</th><th className="py-2">Status</th></tr></thead><tbody><tr><td className="py-3 pr-3 font-bold">{emergencyCase.farmerName}</td><td className="py-3 pr-3">{emergencyCase.crop}</td><td className="py-3 pr-3">{emergencyCase.emergencyQuantityKg} kg</td><td className="py-3 pr-3 text-rose-800 font-bold">{emergencyCase.urgency}</td><td className="py-3 pr-3">{emergencyCase.alternativeBuyers[0]?.name}</td><td className="py-3 font-bold text-amber-800">{t('phase5.recoveryInProgress')}</td></tr></tbody></table></div></Card></div>;
};
