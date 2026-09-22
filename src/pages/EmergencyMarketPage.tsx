import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, RotateCcw, Search, Truck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { useTranslation } from '../context/LanguageContext';
import { EmergencyCase } from '../types';
import { calculateFarmerRecoveryImpact, calculateRecoveryPrice, generateEmergencyMarketPlan, generateEmergencyMarketPlanForOrder, generateRecoveryPlan, rankAlternativeBuyers, simulateCancellation } from '../services/emergencyEngine';
import { clearEmergencyCases, getLatestOrderForUser, loadOrderEmergencyCase, saveEmergencyCase, saveLogisticsPlan } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { generateLogisticsPlan } from '../services/logisticsEngine';

interface Props { onNavigate: (route: string) => void; farmerMode?: boolean; }

export const EmergencyMarketPage: React.FC<Props> = ({ onNavigate, farmerMode = false }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const order = getLatestOrderForUser(currentUser?.id, farmerMode ? 'farmer' : 'buyer');
  const orderId = order?.id;
  const [emergencyCase, setEmergencyCase] = useState<EmergencyCase>(() => orderId
    ? loadOrderEmergencyCase(orderId) ?? generateEmergencyMarketPlanForOrder(order!)
    : generateEmergencyMarketPlan());

  useEffect(() => { saveEmergencyCase(emergencyCase); }, [emergencyCase]);

  const impact = calculateFarmerRecoveryImpact(emergencyCase);
  const price = calculateRecoveryPrice(emergencyCase.marketMin, emergencyCase.marketMax, emergencyCase.alternativeBuyers);
  const hasCancellation = emergencyCase.buyerCancelled;
  const hasSearch = emergencyCase.alternativeBuyers.length > 0 && emergencyCase.status !== 'Detected';
  const hasRecovery = emergencyCase.allocations.length > 0;

  const handleReset = () => {
    clearEmergencyCases();
    setEmergencyCase(generateEmergencyMarketPlan());
  };
  const handleCancellation = () => setEmergencyCase((current) => simulateCancellation(current));
  const handleSearch = () => setEmergencyCase((current) => ({ ...current, alternativeBuyers: rankAlternativeBuyers(current.emergencyQuantityKg, current.marketMin, current.marketMax), status: 'Searching' }));
  const handleGenerate = () => setEmergencyCase((current) => generateRecoveryPlan(current));
  const handleConfirm = () => setEmergencyCase((current) => {
    if (current.status === 'Recovery Confirmed' || current.recoveryLogisticsPlanId) {
      return current;
    }
    const recoveryPlan = {
      ...generateLogisticsPlan(
        [
          {
            id: `${current.farmerId}-recovery`,
            name: current.farmerName,
            location: current.location,
            crop: current.crop,
            quantityKg: current.emergencyQuantityKg,
            grade: current.quality,
            harvestDate: `${current.freshnessDaysRemaining} days left`,
          },
        ],
        current.alternativeBuyers[0]?.name ?? current.farmerName,
        current.location
      ),
      id: `LOG-REC-${current.id}`,
      orderId: current.orderId,
      recoveryCaseId: current.id,
      buyerName: current.alternativeBuyers[0]?.name ?? current.farmerName,
      buyerLocation: current.location,
      totalQuantityKg: current.emergencyQuantityKg,
      crop: current.crop,
      status: 'Collection Planned' as const,
      createdAt: new Date().toISOString(),
    };
    saveLogisticsPlan(recoveryPlan);
    const updated: EmergencyCase = {
      ...current,
      status: 'Recovery Confirmed',
      recoveryLogisticsPlanId: recoveryPlan.id,
      logisticsPlanId: recoveryPlan.id,
    };
    saveEmergencyCase(updated);
    return updated;
  });

  return <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 text-left pb-24">
    <button type="button" onClick={() => onNavigate(farmerMode ? 'farmer-dashboard' : 'buyer-dashboard')} className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer">← {t('common.back')}</button>
    <div className="flex items-start justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-3 py-1 rounded-full">{t('phase5.highPriority')}</span><h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2">{farmerMode ? t('phase5.farmerEmergency') : t('phase5.emergencyMarket')}</h1><p className="text-sm text-slate-600 mt-1 max-w-2xl">{farmerMode ? t('phase5.simpleEmergencyText') : t('phase5.emergencySubtitle')}</p></div><LanguageSelector variant="compact" /></div>

    {!farmerMode && <Card className="p-5 border-2 border-rose-300 bg-rose-50 space-y-3"><div className="flex items-center gap-2 text-rose-950 font-extrabold"><AlertTriangle className="w-5 h-5" />{hasCancellation ? t('phase5.emergencyDetected') : t('phase5.buyerCancellation')}</div><p className="text-sm text-rose-900">{t('phase5.emergencyHero')}</p><p className="text-xs text-rose-800">{t('phase5.emergencyHeroText')}</p><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={handleCancellation} disabled={hasCancellation}>{t('phase5.simulateCancellation')}</Button><Button variant="farmer" onClick={handleSearch} disabled={!hasCancellation}>{t('phase5.findAlternative')} <Search className="w-4 h-4 ml-1" /></Button><Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-1" />{t('phase5.resetDemo')}</Button></div></Card>}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><Card className="p-5 border border-slate-200 space-y-2"><p className="text-xs text-slate-500">{t('phase5.produceAtRisk')}</p><strong className="text-3xl text-rose-800">{emergencyCase.emergencyQuantityKg} kg</strong><p className="text-sm font-bold">{emergencyCase.crop} · {emergencyCase.quality}</p><p className="text-xs text-slate-500">{emergencyCase.farmerName} · {emergencyCase.location}</p></Card><Card className="p-5 border border-slate-200 space-y-2"><p className="text-xs text-slate-500">{t('phase5.riskScore')}</p><strong className="text-3xl text-rose-800">{emergencyCase.riskScore}/100</strong><p className="text-sm font-extrabold text-rose-800">{emergencyCase.urgency}</p><p className="text-[11px] text-slate-400">{t('phase5.demoLabel')}</p></Card><Card className="p-5 border border-slate-200 space-y-2"><p className="text-xs text-slate-500">{t('phase5.freshness')}</p><strong className="text-3xl text-amber-700">{emergencyCase.freshnessDaysRemaining}</strong><p className="text-sm font-bold">{t('phase5.daysRemaining', { days: emergencyCase.freshnessDaysRemaining })}</p><p className="text-xs text-amber-800">{emergencyCase.freshnessRisk}</p></Card></div>

    <Card className="p-5 border border-slate-200 space-y-3"><h2 className="font-extrabold text-slate-900">{t('phase5.produceAtRisk')}</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm"><div><p className="text-xs text-slate-500">{t('phase5.originalPrice')}</p><strong>₹{emergencyCase.originalExpectedPrice}/kg</strong></div><div><p className="text-xs text-slate-500">{t('phase5.originalBuyer')}</p><strong>{emergencyCase.buyerCancelled ? 'Cancelled' : 'Original buyer'}</strong></div><div><p className="text-xs text-slate-500">Confirmed</p><strong>{emergencyCase.confirmedQuantityKg} kg</strong></div><div><p className="text-xs text-slate-500">{t('phase5.buyerCancellation')}</p><strong className={hasCancellation ? 'text-rose-800' : 'text-slate-700'}>{hasCancellation ? '300 kg' : 'Not simulated'}</strong></div></div></Card>

    <Card className="p-5 border border-emerald-200 bg-emerald-50/60 space-y-3"><div className="flex items-center justify-between gap-3"><h2 className="font-extrabold text-emerald-950">{t('phase5.recoveryRecommendation')}</h2><span className="text-[11px] font-bold px-2 py-1 rounded-full bg-white text-emerald-800">{t('phase5.aiAssistedPrototype')}</span></div><p className="text-sm text-emerald-950">{hasCancellation ? `300 kg of Tomato is currently at risk because the original buyer cancelled the order. ${emergencyCase.alternativeBuyers[0]?.name ?? 'Alternative buyers'} is the strongest available recovery option.` : 'Simulate the cancellation to generate a recovery recommendation.'}</p><div className="flex flex-wrap gap-4 text-sm font-bold text-emerald-900"><span>{t('phase5.recoveryPrice')}: ₹{price.min}–₹{price.max}/kg</span><span>{t('phase5.projectedRecovery')}: ₹{impact.recoveryValue.toLocaleString('en-IN')}</span></div></Card>

    <Card className="p-5 border border-slate-200 space-y-4"><div className="flex items-center justify-between gap-3"><h2 className="font-extrabold text-slate-900">{t('phase5.alternativeBuyers')}</h2>{hasSearch && <span className="text-xs text-emerald-800 font-bold">{emergencyCase.alternativeBuyers.length} buyers found</span>}</div>{!hasSearch ? <p className="text-sm text-slate-500">{t('phase5.findAlternative')} to view ranked demo buyers.</p> : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{emergencyCase.alternativeBuyers.map((buyer, index) => <div key={buyer.id} className="p-4 rounded-xl border border-slate-200 space-y-2"><div className="flex justify-between gap-2"><div><span className="text-[11px] text-slate-400">#{index + 1}</span><h3 className="font-extrabold text-slate-900">{buyer.name}</h3></div><strong className="text-emerald-800">{buyer.matchScore}%</strong></div><div className="grid grid-cols-3 gap-2 text-xs"><span>{buyer.requiredQuantityKg} kg</span><span>₹{buyer.offerPerKg}/kg</span><span>{buyer.distanceKm} km</span></div><div className="text-[11px] text-slate-500">Capacity fit {buyer.capacityFit}% · {t('phase5.reliability')} {buyer.reliability}% · {buyer.urgency}</div></div>)}</div>}</Card>

    <Card className="p-5 border border-slate-200 space-y-4"><h2 className="font-extrabold text-slate-900">{t('phase5.recoveryAllocation')}</h2>{!hasRecovery ? <Button variant="farmer" onClick={handleGenerate} disabled={!hasSearch}>{t('phase5.generateRecovery')} <ArrowRight className="w-4 h-4 ml-1" /></Button> : <><div className="space-y-2">{emergencyCase.allocations.map((allocation) => <div key={allocation.buyerId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"><span><strong>{allocation.quantityKg} kg</strong> → {allocation.buyerName}</span><span>₹{allocation.pricePerKg}/kg = <strong>₹{allocation.totalValue.toLocaleString('en-IN')}</strong></span></div>)}</div><div className="grid grid-cols-3 gap-3 text-sm"><div><p className="text-xs text-slate-500">{t('phase5.recoveredQuantity')}</p><strong className="text-emerald-800">{impact.recoveredQuantityKg} kg</strong></div><div><p className="text-xs text-slate-500">{t('phase5.remainingQuantity')}</p><strong>{impact.remainingQuantityKg} kg</strong></div><div><p className="text-xs text-slate-500">{t('phase5.totalRecoveryValue')}</p><strong>₹{impact.recoveryValue.toLocaleString('en-IN')}</strong></div></div><div className="flex flex-wrap gap-2"><Button variant="farmer" onClick={handleConfirm} disabled={emergencyCase.status === 'Recovery Confirmed'}>{emergencyCase.status === 'Recovery Confirmed' ? <CheckCircle2 className="w-4 h-4 mr-1" /> : null}{t('phase5.confirmRecovery')}</Button><Button variant="outline" onClick={() => onNavigate(farmerMode ? 'farmer-logistics' : 'buyer-shipments')}><Truck className="w-4 h-4 mr-1" />{t('phase5.sendToLogistics')}</Button></div></>}</Card>

    {farmerMode && <Card className="p-5 border border-slate-200 space-y-3"><h2 className="font-extrabold text-slate-900">{t('phase5.recoveryProgress')}</h2><p className="text-sm">{impact.recoveredQuantityKg} kg → {impact.recoveredQuantityKg} kg recovered</p><div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-700" style={{ width: `${emergencyCase.emergencyQuantityKg ? (impact.recoveredQuantityKg / emergencyCase.emergencyQuantityKg) * 100 : 0}%` }} /></div><Button variant="farmer" fullWidth onClick={handleCancellation} disabled={hasCancellation}>{t('phase5.recoverMyProduce')}</Button></Card>}
  </div>;
};
