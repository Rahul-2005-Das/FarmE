import React, { useMemo, useState } from 'react';
import { ArrowRight, Bot, CheckCircle2, Leaf, MessageCircle, Sparkles, Truck, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { requestAiChat, requestDemandForecast, requestFarmerCopilot, DemandForecastResponse, FarmerCopilotResponse } from '../services/apiClient';
import { getPrimaryCropRecommendation } from '../services/cropRecommendationEngine';
import { loadCropRecommendations } from '../services/storage';

interface Props { onNavigate: (route: string) => void; }

export const FarmerAiCopilotPage: React.FC<Props> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { t, language } = useTranslation();
  const farmerId = currentUser?.id || 'f-101';
  const saved = loadCropRecommendations(farmerId)[0];
  const [location, setLocation] = useState(saved?.district || (currentUser as any)?.district || 'South 24 Parganas');
  const [soilType, setSoilType] = useState(saved?.soil || 'Loamy soil');
  const [waterAvailability, setWaterAvailability] = useState(saved?.waterAvailability || 'Moderate water');
  const [landArea, setLandArea] = useState(String((currentUser as any)?.farmSizeAcres || 2.5));
  const [season, setSeason] = useState('Current harvest season');
  const [preferredCrop, setPreferredCrop] = useState('');
  const [result, setResult] = useState<FarmerCopilotResponse | null>(null);
  const [forecast, setForecast] = useState<DemandForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const fallback = useMemo(() => getPrimaryCropRecommendation(currentUser?.name || 'Ramesh Mondal', location, farmerId, soilType, waterAvailability), [currentUser?.name, farmerId, location, soilType, waterAvailability]);
  const top = fallback.opportunities[0];

  const analyze = async () => {
    setLoading(true);
    const response = await requestFarmerCopilot({ farmerId, farmerName: currentUser?.name || 'Ramesh Mondal', location, soilType, waterAvailability, landAreaAcres: Number(landArea) || undefined, season, preferredCrop: preferredCrop || undefined, language });
    setResult(response || {
      recommended_crops: fallback.opportunities.slice(0, 3).map((item) => ({ crop: item.crop, score: item.score, reason: item.reason })),
      demand_outlook: language === 'bn' ? 'ডেমো ডেটায় চাহিদা বিশ্লেষণ সম্পন্ন' : language === 'hi' ? 'डेमो डेटा में मांग का विश्लेषण पूरा हुआ' : top.demandStatus,
      price_outlook: language === 'bn' ? `₹${top.expectedPrice.min}–₹${top.expectedPrice.max}/কেজি` : language === 'hi' ? `₹${top.expectedPrice.min}–₹${top.expectedPrice.max}/किग्रा` : `₹${top.expectedPrice.min}–₹${top.expectedPrice.max}/kg`,
      risk: language === 'bn' ? 'মাঝারি' : language === 'hi' ? 'मध्यम' : top.risk,
      reasoning: language === 'bn'
        ? `প্রোটোটাইপ চাহিদা, নির্দেশক দাম, ক্রেতা মিল এবং লজিস্টিকস রুট অনুযায়ী ${top.crop} এই জমির জন্য উপযুক্ত।`
        : language === 'hi'
        ? `प्रोटोटाइप मांग, सांकेतिक मूल्य, खरीदार मिलान और लॉजिस्टिक्स रूट के अनुसार ${top.crop} इस खेत के लिए उपयुक्त है।`
        : `The prototype demand signal, indicative price range, existing buyer matches, and logistics route support ${top.crop} for the selected farm inputs.`,
      potential_buyer_categories: [...new Set(top.buyerMatches.map((buyer) => buyer.buyerType))],
      logistics_considerations: top.farmToMarketOpportunity.route,
      next_action: language === 'bn' ? 'ক্রেতার মিল দেখুন এবং তালিকা তৈরি করুন।' : language === 'hi' ? 'खरीदार मिलान देखें और सूची बनाएं।' : 'Review buyer matches and create a listing.',
      mode: 'prototype',
      label: 'Prototype Intelligence / Offline Fallback',
    });
    setForecast(await requestDemandForecast({ crop: preferredCrop || top.crop, location, currentSupply: 1700, currentDemand: 2400, season, language }));
    setLoading(false);
  };

  const ask = async (prompt = question) => {
    if (!prompt.trim()) return;
    setChatLoading(true);
    const response = await requestAiChat(prompt, { farmerId, location, soilType, waterAvailability, landArea, season, preferredCrop, recommendation: result || fallback });
    setChatAnswer(response?.answer || t('copilot.offlineAnswer'));
    setChatLoading(false);
    setQuestion('');
  };

  const display = result || {
    recommended_crops: [{ crop: top.crop, score: top.score, reason: top.reason }],
    demand_outlook: language === 'bn' ? 'ডেমো ডেটায় চাহিদা বিশ্লেষণ সম্পন্ন' : language === 'hi' ? 'डेमो डेटा में मांग का विश्लेषण पूरा हुआ' : top.demandStatus,
    price_outlook: language === 'bn' ? `₹${top.expectedPrice.min}–₹${top.expectedPrice.max}/কেজি` : language === 'hi' ? `₹${top.expectedPrice.min}–₹${top.expectedPrice.max}/किग्रा` : `₹${top.expectedPrice.min}–₹${top.expectedPrice.max}/kg`,
    risk: language === 'bn' ? 'মাঝারি' : language === 'hi' ? 'मध्यम' : top.risk,
    reasoning: t('copilot.initialPrompt'),
    potential_buyer_categories: [...new Set(top.buyerMatches.map((buyer) => buyer.buyerType))],
    logistics_considerations: top.farmToMarketOpportunity.route,
    next_action: t('copilot.analyzePrompt'),
    mode: 'prototype' as const,
    label: t('copilot.offlineMode'),
  };
  const recommendedCrop = display.recommended_crops[0]?.crop || top.crop;
  const estimatedReturn = fallback.opportunities.find((item) => item.crop === recommendedCrop)?.estimatedReturn || top.estimatedReturn;
  const suggestedQuestions = [t('copilot.questionGrow'), t('copilot.questionRecommended'), t('copilot.questionBuyer'), t('copilot.questionTransport'), t('copilot.questionCancel')];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 text-left pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full"><Sparkles className="w-3.5 h-3.5" />{t('copilot.prototype')}</span><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{t('copilot.title')}</h1><p className="text-sm text-slate-500 mt-1">{t('copilot.subtitle')}</p></div>
        <LanguageSelector variant="compact" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
        <Card className="p-5 border border-slate-200 space-y-4">
          <h2 className="font-extrabold text-slate-900">{t('copilot.inputsTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-bold text-slate-600">{t('copilot.location')}<select value={location} onChange={(event) => setLocation(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal"><option>South 24 Parganas</option><option>Hooghly</option><option>Nadia</option><option>Howrah</option></select></label>
            <label className="text-xs font-bold text-slate-600">{t('copilot.soil')}<select value={soilType} onChange={(event) => setSoilType(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal"><option>Loamy soil</option><option>Alluvial soil</option><option>Sandy soil</option></select></label>
            <label className="text-xs font-bold text-slate-600">{t('copilot.water')}<select value={waterAvailability} onChange={(event) => setWaterAvailability(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal"><option>Reliable water</option><option>Moderate water</option><option>Limited water</option></select></label>
            <label className="text-xs font-bold text-slate-600">{t('copilot.land')}<input value={landArea} onChange={(event) => setLandArea(event.target.value)} type="number" min="0" step="0.1" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal" /></label>
            <label className="text-xs font-bold text-slate-600">{t('copilot.season')}<select value={season} onChange={(event) => setSeason(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal"><option>Current harvest season</option><option>Early monsoon sowing</option><option>Winter sowing</option></select></label>
            <label className="text-xs font-bold text-slate-600">{t('copilot.preferredCrop')}<input value={preferredCrop} onChange={(event) => setPreferredCrop(event.target.value)} placeholder={t('copilot.optional')} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal" /></label>
          </div>
          <button onClick={analyze} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">{loading ? t('common.loading') : t('copilot.analyze')} <ArrowRight className="w-4 h-4" /></button>
        </Card>

        <Card className="p-5 border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white space-y-4">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Leaf className="w-5 h-5 text-emerald-700" /><h2 className="font-extrabold text-slate-900">{t('copilot.decisionTitle')}</h2></div><span className="rounded-full bg-white border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800">{display.label}</span></div>
          <div className="rounded-2xl border border-emerald-200 bg-white p-4"><div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">{t('copilot.recommendedCrop')}</div><div className="mt-1 text-2xl font-black text-slate-900">{recommendedCrop}</div><p className="mt-2 text-sm text-slate-600">{display.reasoning}</p></div>
          <div className="grid grid-cols-2 gap-3 text-sm"><div><span className="text-xs text-slate-500">{t('copilot.demand')}</span><div className="font-extrabold text-slate-900">{display.demand_outlook}</div></div><div><span className="text-xs text-slate-500">{t('copilot.price')}</span><div className="font-extrabold text-slate-900">{display.price_outlook}</div></div><div><span className="text-xs text-slate-500">{t('copilot.risk')}</span><div className="font-extrabold text-slate-900">{display.risk}</div></div><div><span className="text-xs text-slate-500">{t('copilot.buyerOpportunity')}</span><div className="font-extrabold text-slate-900">{display.potential_buyer_categories.length ? t('copilot.available') : t('copilot.reviewMatching')}</div></div></div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><strong>{t('copilot.estimatedReturn')}:</strong> ₹{estimatedReturn.toLocaleString('en-IN')} · {t('copilot.illustrativeOnly')}<br /><strong>{t('copilot.logistics')}:</strong> {display.logistics_considerations}</div>
          <div className="flex flex-wrap gap-2"><button onClick={() => onNavigate('farmer-matched-buyers')} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-3 py-2 text-xs font-bold text-white"><Users className="w-4 h-4" />{t('copilot.findBuyers')}</button><button onClick={() => onNavigate('farmer-sell')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white"><CheckCircle2 className="w-4 h-4" />{t('copilot.createListing')}</button><button onClick={() => onNavigate('farmer-logistics')} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700"><Truck className="w-4 h-4" />{t('copilot.viewLogistics')}</button></div>
        </Card>
      </div>

      {forecast && (
        <Card className="p-5 border border-sky-200 bg-sky-50/60 space-y-3">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-extrabold text-slate-900">{t('copilot.forecastTitle')}</h2><p className="text-xs text-slate-500 mt-1">{forecast.label}</p></div><span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-bold text-sky-800">{forecast.confidence}% {t('copilot.confidence')}</span></div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm"><div><span className="text-xs text-slate-500">{t('copilot.demand')}</span><div className="font-extrabold">{forecast.demandLevel}</div></div><div><span className="text-xs text-slate-500">{t('copilot.supply')}</span><div className="font-extrabold">{forecast.supplyLevel}</div></div><div><span className="text-xs text-slate-500">{t('copilot.gap')}</span><div className="font-extrabold">{forecast.supplyDemandGap > 0 ? '+' : ''}{forecast.supplyDemandGap} kg</div></div><div><span className="text-xs text-slate-500">{t('copilot.pressure')}</span><div className="font-extrabold">{forecast.marketPressure}</div></div><div><span className="text-xs text-slate-500">{t('copilot.risk')}</span><div className="font-extrabold">{forecast.risk}</div></div></div>
          <p className="text-sm text-slate-700 leading-relaxed">{forecast.explanation}</p>
        </Card>
      )}

      <Card className="p-5 border border-slate-200 space-y-4"><div className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-blue-700" /><h2 className="font-extrabold text-slate-900">{t('copilot.chatTitle')}</h2></div><div className="flex flex-wrap gap-2">{suggestedQuestions.map((prompt) => <button key={prompt} onClick={() => ask(prompt)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">{prompt}</button>)}</div><div className="flex gap-2"><input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void ask(); }} placeholder={t('copilot.chatPlaceholder')} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /><button onClick={() => void ask()} disabled={chatLoading} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{chatLoading ? t('common.loading') : t('copilot.ask')}</button></div>{chatAnswer && <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-slate-700">{chatAnswer}</div>}</Card>
    </div>
  );
};
