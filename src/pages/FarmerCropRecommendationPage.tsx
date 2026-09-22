import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  MapPinned,
  PackageCheck,
  Sparkles,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { Card } from '../components/ui/Card';
import { getPrimaryCropRecommendation } from '../services/cropRecommendationEngine';
import { requestFarmerCopilot, FarmerCopilotResponse } from '../services/apiClient';
import { loadCropRecommendations, saveCropRecommendations } from '../services/storage';
import { CropRecommendationResult } from '../types';

interface FarmerCropRecommendationPageProps {
  onNavigate: (route: string) => void;
}

export const FarmerCropRecommendationPage: React.FC<FarmerCropRecommendationPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const farmerId = currentUser?.id || 'f-101';
  const savedRecommendation = loadCropRecommendations(farmerId)[0];
  const [soil, setSoil] = useState(savedRecommendation?.soil || 'Loamy soil');
  const [waterAvailability, setWaterAvailability] = useState(savedRecommendation?.waterAvailability || 'Moderate water');
  const [location, setLocation] = useState(savedRecommendation?.district || (currentUser as any)?.district || 'South 24 Parganas');
  const [hasAnalyzed, setHasAnalyzed] = useState(true);
  const [copilot, setCopilot] = useState<FarmerCopilotResponse | null>(null);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  const recommendations = useMemo<CropRecommendationResult>(() => {
    const saved = loadCropRecommendations(farmerId);
    const profile = currentUser ?? { name: 'Ramesh Mondal', district: 'South 24 Parganas' };
    const savedRecommendation = saved.find((item) => item.district === location && item.soil === soil && item.waterAvailability === waterAvailability);
    return savedRecommendation ?? getPrimaryCropRecommendation(
      profile.name,
      location || (profile as any).district || 'South 24 Parganas',
      farmerId,
      soil,
      waterAvailability,
    );
  }, [currentUser, farmerId, location, soil, waterAvailability]);

  const handleAnalyze = async () => {
    setHasAnalyzed(true);
    const existing = loadCropRecommendations().filter((item) => item.farmerId !== farmerId);
    saveCropRecommendations([...existing, getPrimaryCropRecommendation(
      currentUser?.name,
      location,
      farmerId,
      soil,
      waterAvailability,
    )]);
    setIsCopilotLoading(true);
    const response = await requestFarmerCopilot({
      farmerId,
      farmerName: currentUser?.name || 'Ramesh Mondal',
      location,
      soilType: soil,
      waterAvailability,
      landAreaAcres: (currentUser as any)?.farmSizeAcres,
    });
    setCopilot(response);
    setIsCopilotLoading(false);
  };

  const topOpportunity = useMemo(() => recommendations?.opportunities?.[0], [recommendations]);
  const localizedRisk = topOpportunity?.risk === 'Low'
    ? t('farmer.cropRecommendation.riskLow')
    : topOpportunity?.risk === 'Medium'
    ? t('farmer.cropRecommendation.riskMedium')
    : t('farmer.cropRecommendation.riskHigh');
  const localizedDemand = topOpportunity?.demandStatus === 'High demand'
    ? t('farmer.cropRecommendation.demandHigh')
    : topOpportunity?.demandStatus === 'Surplus'
    ? t('farmer.cropRecommendation.demandSurplus')
    : t('farmer.cropRecommendation.demandBalanced');

  if (!hasAnalyzed || !recommendations || !topOpportunity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-left">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 text-left space-y-6 pb-24">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-900">
            <Sparkles className="w-3.5 h-3.5" />
            {t('farmer.cropRecommendation.prototypeBadge')}
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('farmer.cropRecommendation.pageTitle')}
          </h1>
        </div>
        <LanguageSelector variant="compact" />
      </div>

      <Card className="p-5 border border-slate-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <MapPinned className="w-5 h-5 text-emerald-700" />
          <h2 className="text-lg font-extrabold text-slate-900">{t('farmer.cropRecommendation.inputsTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-xs font-bold text-slate-600">
            {t('farmer.cropRecommendation.location')}
            <select value={location} onChange={(event) => setLocation(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800">
              <option value="South 24 Parganas">{t('farmer.cropRecommendation.locationSouth24')}</option>
              <option value="Hooghly">{t('farmer.cropRecommendation.locationHooghly')}</option>
              <option value="Nadia">{t('farmer.cropRecommendation.locationNadia')}</option>
              <option value="Howrah">{t('farmer.cropRecommendation.locationHowrah')}</option>
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            {t('farmer.cropRecommendation.soil')}
            <select value={soil} onChange={(event) => setSoil(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800">
              <option value="Loamy soil">{t('farmer.cropRecommendation.soilLoamy')}</option>
              <option value="Alluvial soil">{t('farmer.cropRecommendation.soilAlluvial')}</option>
              <option value="Sandy soil">{t('farmer.cropRecommendation.soilSandy')}</option>
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            {t('farmer.cropRecommendation.water')}
            <select value={waterAvailability} onChange={(event) => setWaterAvailability(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800">
              <option value="Reliable water">{t('farmer.cropRecommendation.waterReliable')}</option>
              <option value="Moderate water">{t('farmer.cropRecommendation.waterModerate')}</option>
              <option value="Limited water">{t('farmer.cropRecommendation.waterLimited')}</option>
            </select>
          </label>
        </div>
        <button onClick={handleAnalyze} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">
          {t('farmer.cropRecommendation.analyze')} <ArrowRight className="w-4 h-4" />
        </button>
      </Card>

      <Card className="p-5 border border-blue-200 bg-blue-50/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800">{t('farmer.cropRecommendation.copilotTitle')}</div>
            <h2 className="mt-1 text-lg font-extrabold text-slate-900">{t('farmer.cropRecommendation.copilotSubtitle')}</h2>
          </div>
          <span className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-bold text-blue-800">
            {isCopilotLoading ? t('common.loading') : copilot?.label || t('farmer.cropRecommendation.copilotOffline')}
          </span>
        </div>
        {copilot && !isCopilotLoading && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
            <div><strong>{t('farmer.cropRecommendation.copilotDemand')}:</strong> {copilot.demand_outlook}</div>
            <div><strong>{t('farmer.cropRecommendation.copilotPrice')}:</strong> {copilot.price_outlook}</div>
            <div><strong>{t('farmer.cropRecommendation.copilotRisk')}:</strong> {copilot.risk}</div>
            <div><strong>{t('farmer.cropRecommendation.copilotBuyers')}:</strong> {copilot.potential_buyer_categories.join(', ') || t('farmer.cropRecommendation.copilotNoBuyers')}</div>
            <p className="sm:col-span-2 leading-relaxed">{copilot.reasoning}</p>
            <p className="sm:col-span-2 leading-relaxed"><strong>{t('farmer.cropRecommendation.copilotNextAction')}:</strong> {copilot.next_action}</p>
          </div>
        )}
      </Card>

      <Card className="p-5 sm:p-6 border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
              <BadgeCheck className="w-3.5 h-3.5" />
              {t('farmer.cropRecommendation.topPickLabel')}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {topOpportunity.crop} • {topOpportunity.market}
            </h2>
            <p className="max-w-2xl text-sm text-slate-600 leading-relaxed">
              {recommendations.summary}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-900 text-white p-4 min-w-[220px]">
            <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-200">{t('farmer.cropRecommendation.score')}</div>
            <div className="mt-2 text-3xl font-black">{topOpportunity.score}/100</div>
            <div className="mt-1 text-xs text-emerald-100">
              {t('farmer.cropRecommendation.demandLabel')}: {localizedDemand}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('farmer.cropRecommendation.expectedPrice')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-xl font-black text-slate-900">
            ₹{topOpportunity.expectedPrice.recommended}/kg
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {topOpportunity.expectedPrice.min}–{topOpportunity.expectedPrice.max} {t('common.perKg')}
          </div>
        </Card>

        <Card className="p-4 border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('farmer.cropRecommendation.risk')}</span>
            <Clock3 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 text-xl font-black text-slate-900">{localizedRisk}</div>
          <div className="text-xs text-slate-500 mt-1">{t('farmer.cropRecommendation.estimatedReturn')}: ₹{topOpportunity.estimatedReturn.toLocaleString('en-IN')}</div>
        </Card>

        <Card className="p-4 border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('farmer.cropRecommendation.buyers')}</span>
            <PackageCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 text-xl font-black text-slate-900">{topOpportunity.buyerMatches.length}</div>
          <div className="text-xs text-slate-500 mt-1">{t('farmer.cropRecommendation.activeBuyers')}</div>
        </Card>

        <Card className="p-4 border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('farmer.cropRecommendation.route')}</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 text-sm font-bold text-slate-900">{topOpportunity.farmToMarketOpportunity.route}</div>
          <div className="text-xs text-slate-500 mt-1">₹{topOpportunity.farmToMarketOpportunity.logisticsSavings}/kg saved</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.95fr] gap-5">
        <Card className="p-5 border border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <MapPinned className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-extrabold text-slate-900">{t('farmer.cropRecommendation.marketPaths')}</h3>
          </div>

          <div className="space-y-4">
            {recommendations.opportunities.map((opportunity) => (
              <div key={opportunity.crop} className={`rounded-2xl border p-4 ${opportunity.crop === topOpportunity.crop ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{opportunity.crop}</div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">{opportunity.market}</div>
                  </div>
                  <div className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    {opportunity.score}/100
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-white px-2 py-1 border border-slate-200">{opportunity.demandStatus === 'High demand' ? t('farmer.cropRecommendation.demandHigh') : opportunity.demandStatus === 'Surplus' ? t('farmer.cropRecommendation.demandSurplus') : t('farmer.cropRecommendation.demandBalanced')}</span>
                  <span className="rounded-full bg-white px-2 py-1 border border-slate-200">₹{opportunity.expectedPrice.recommended}/kg</span>
                  <span className="rounded-full bg-white px-2 py-1 border border-slate-200">{opportunity.buyerMatches.length} buyers</span>
                </div>

                <p className="mt-3 text-sm text-slate-600">{opportunity.reason}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <PackageCheck className="w-5 h-5 text-blue-700" />
            <h3 className="text-lg font-extrabold text-slate-900">{t('farmer.cropRecommendation.buyerMatches')}</h3>
          </div>

          <div className="space-y-3">
            {topOpportunity.buyerMatches.map((buyer) => (
              <div key={`${buyer.buyerName}-${buyer.district}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-800">{buyer.buyerName}</div>
                    <div className="text-[11px] text-slate-500">{buyer.buyerType}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900">₹{buyer.offeredPricePerKg}</div>
                    <div className="text-[11px] text-slate-500">/kg</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>{buyer.requiredQuantityKg} kg</span>
                  <span>{buyer.district}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Clock3 className="w-4 h-4" />
              {t('farmer.cropRecommendation.logisticsTitle')}
            </div>
            <p className="mt-2 text-sm text-amber-900 leading-relaxed">
              {topOpportunity.farmToMarketOpportunity.collectionPoint} • {topOpportunity.farmToMarketOpportunity.route}
            </p>
            <p className="mt-2 text-xs text-amber-800">
              {t('farmer.cropRecommendation.logisticsNote', { savings: topOpportunity.farmToMarketOpportunity.logisticsSavings })}
            </p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-2">
        <button
          onClick={() => onNavigate('farmer-dashboard')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          {t('common.back')}
        </button>
        <button
          onClick={() => onNavigate('farmer-sell')}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
        >
          {t('farmer.cropRecommendation.action')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
