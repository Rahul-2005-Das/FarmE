import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { FarmerProduceListing } from '../types';
import {
  TrendingUp,
  Clock,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  DollarSign,
  Info
} from 'lucide-react';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { analyzeDemand } from '../services/demandEngine';
import { analyzePrice } from '../services/priceEngine';

interface AiAdvisorPageProps {
  onNavigate: (route: string) => void;
}

export const AiAdvisorPage: React.FC<AiAdvisorPageProps> = ({ onNavigate }) => {
  const { language } = useTranslation();
  const { currentUser } = useAuth();
  const [isWhyOpen, setIsWhyOpen] = useState(true);

  const [draft] = useState<Partial<FarmerProduceListing>>(() => {
    const saved = sessionStorage.getItem('krishok_bandhu_draft_listing');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      crop: 'Tomato',
      quantity: 500,
      grade: 'Grade A',
      harvestDate: 'Within 4 days',
      expectedPrice: 35,
      location: { district: 'South 24 Parganas', village: 'Champahati' }
    };
  });

  const crop = draft.crop || 'Tomato';
  const quantity = draft.quantity || 500;
  const grade = draft.grade || 'Grade A';
  const harvestDate = draft.harvestDate || (language === 'bn' ? '৪ দিনের মধ্যে' : 'Within 4 days');
  const expectedPrice = draft.expectedPrice || 35;
  const location = draft.location || { district: 'South 24 Parganas', village: 'Champahati' };

  const demandAnalysis = analyzeDemand({
    crop,
    expectedSupply: quantity,
    harvestDate,
    location: location.district,
  });
  const priceAnalysis = analyzePrice({
    crop,
    farmerExpectedPrice: expectedPrice,
    buyerOffers: [31, 30, 29],
  });
  const suggestedMin = priceAnalysis.recommendedMin;
  const suggestedMax = priceAnalysis.recommendedMax;
  const preAllocateKg = Math.round(quantity * 0.6);
  const bufferKg = quantity - preAllocateKg;

  const handlePublishFromAdvisor = () => {
    const listingId = `PRD-${Date.now().toString().slice(-4)}`;
    const newListing: FarmerProduceListing = {
      id: listingId,
      farmerId: currentUser?.id || 'f-101',
      farmerName: currentUser?.name || 'Ramesh Mondal',
      farmerMobile: currentUser?.mobile || '9830123456',
      crop,
      quantity,
      unit: 'kg',
      grade,
      expectedPrice,
      harvestDate,
      location,
      status: 'Looking for Buyers',
      createdAt: new Date().toISOString().split('T')[0],
      aiRecommendation: {
        demandLevel: 'High demand',
        suggestedPriceMin: suggestedMin,
        suggestedPriceMax: suggestedMax,
        sellingStrategy: `Allocate ${preAllocateKg} kg to confirmed pre-orders and reserve ${bufferKg} kg for high-value demand.`,
        sellingStrategyBn: `বর্তমান অগ্রিম ক্রেতাদের জন্য ${preAllocateKg} কেজি বরাদ্দ করুন এবং বাকি ${bufferKg} কেজি সেরা মূল্যের জন্য রাখুন।`,
        sellingStrategyHi: `लगभग ${preAllocateKg} किग्रा मौजूदा खरीदारों को आवंटित करें और बाकी ${bufferKg} किग्रा रखें।`,
        marketOpportunity: 'Regional demand in South Bengal wholesale clusters is currently high.',
        marketOpportunityBn: 'নিকটবর্তী কলকাতা ও হাওড়া পাইকারি বাজারে তাজা ফসলের চাহিদা বর্তমানে খুবই ভালো।',
        marketOpportunityHi: 'थोक मंडियों में मांग में भारी तेजी है।',
        freshnessRisk: 'Low freshness risk now • Remains at peak firmness for 4 days post-harvest.',
        freshnessRiskBn: 'এখন ঝুঁকি কম • নির্দিষ্ট ফসল তোলার পরবর্তী ৪ দিন পর্যন্ত গুণমান সর্বোচ্চ থাকবে।',
        freshnessRiskHi: 'अभी जोखिम कम है • 4 दिन तक फसल पूरी तरह ताजी रहेगी।',
        recommendedAction: 'Find buyers before harvest and schedule collection.',
        recommendedActionBn: 'ফসল কাটার পূর্বেই ক্রেতাদের সন্ধান সম্পন্ন করুন এবং পরিবহন গাড়ির সময়সূচী নির্ধারণ করুন।',
        recommendedActionHi: 'कटाई से पहले ही खरीदारों से संपर्क कर पिकअप तय करें।',
        whyFactors: []
      }
    };

    const existing = JSON.parse(localStorage.getItem('krishok_bandhu_farmer_listings') || '[]');
    localStorage.setItem('krishok_bandhu_farmer_listings', JSON.stringify([newListing, ...existing.filter((listing: FarmerProduceListing) => listing.id !== newListing.id)]));

    onNavigate('farmer-dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 text-left space-y-6 pb-24">
      {/* Top Header & Tags */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-emerald-650 rounded-full bg-emerald-700" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {language === 'bn' ? 'AI কৃষক পরামর্শ' : 'AI Farmer Advisor'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 bg-amber-50 text-amber-900 rounded-full border border-amber-200">
            {language === 'bn' ? 'এআই অনুমান' : 'Prototype AI Estimate'}
          </span>
          <LanguageSelector variant="compact" />
        </div>
      </div>

      {/* Main Crop Overview Hero Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm flex items-center gap-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-2xs">
          🍅
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            {language === 'bn' ? 'ফসল বিশ্লেষণ' : 'Produce Analysis'}
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
            {language === 'bn'
              ? `আপনার ${quantity} কেজি ${crop} (${grade}) এবং ${harvestDate} প্রস্তুত হবে।`
              : `You have ${quantity} kg of ${grade} ${crop} expected in 4 days.`}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            📍 {location.village}, {location.district} • {language === 'bn' ? `প্রত্যাশিত দর ₹${expectedPrice}/কেজি` : `Expected price ₹${expectedPrice}/kg`}
          </p>
        </div>
      </div>

      {/* 6 Compact Recommendation Cards in 2x3 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* 1. Demand */}
        <Card className="p-4 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'চাহিদা' : 'Demand'}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-extrabold text-emerald-800">
            {language === 'bn'
              ? demandAnalysis.status === 'SURPLUS'
                ? 'উদ্বৃত্ত (Surplus)'
                : demandAnalysis.status === 'BALANCED'
                ? 'ভারসাম্যপূর্ণ (Balanced)'
                : 'বেশি (High)'
              : demandAnalysis.status === 'SURPLUS'
              ? 'Surplus'
              : demandAnalysis.status === 'BALANCED'
              ? 'Balanced'
              : 'High demand'}
          </div>
          <p className="text-[11px] text-slate-500">
            {language === 'bn' ? 'ডেমো চাহিদা বিশ্লেষণ' : demandAnalysis.explanation}
          </p>
        </Card>

        {/* 2. Suggested Price */}
        <Card className="p-4 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'সুপারিশকৃত দাম' : 'Suggested Price'}
            </span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900">
            ₹{suggestedMin}–{suggestedMax} <span className="text-xs font-normal text-slate-500">/ {language === 'bn' ? 'কেজি' : 'kg'}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {language === 'bn' ? 'বর্তমান মান্ডি দরের সাথে সামঞ্জস্যপূর্ণ' : 'Aligned with current mandi benchmarks'}
          </p>
        </Card>

        {/* 3. Selling Strategy */}
        <Card className="p-4 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'বিক্রয় কৌশল' : 'Selling Strategy'}
            </span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-extrabold text-purple-900">
            {language === 'bn' ? `${preAllocateKg} কেজি এখন + ${bufferKg} কেজি সংরক্ষণ` : `${preAllocateKg} kg pre-order + ${bufferKg} kg reserve`}
          </div>
          <p className="text-[11px] text-slate-500">
            {language === 'bn' ? 'ঝুঁকি কমাতে দুই ভাগে বিক্রি করুন' : 'Split allocation minimizes risk'}
          </p>
        </Card>

        {/* 4. Market Opportunity */}
        <Card className="p-4 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'বাজার সুযোগ' : 'Market Opportunity'}
            </span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-sm font-extrabold text-blue-900">
            {language === 'bn' ? 'কাছাকাছি বাজারে চাহিদা ভালো' : 'Strong Nearby Demand'}
          </div>
          <p className="text-[11px] text-slate-500">
            {language === 'bn' ? 'কলকাতা ও শহরতলীর খুচরা বিক্রেতা সক্রিয়' : 'City distributors actively buying'}
          </p>
        </Card>

        {/* 5. Freshness Risk */}
        <Card className="p-4 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'ফ্রেশনেস ঝুঁকি' : 'Freshness Risk'}
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm font-extrabold text-slate-800">
            {language === 'bn' ? 'এখন কম • ৪ দিন পর মাঝারি' : 'Low now • Med after 4 days'}
          </div>
          <p className="text-[11px] text-slate-500">
            {language === 'bn' ? 'ফসল কাটার উপযুক্ত সময় এখনই' : 'Ideal harvesting window'}
          </p>
        </Card>

        {/* 6. Recommended Action */}
        <Card className="p-4 border border-emerald-300 bg-emerald-50/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              {language === 'bn' ? 'সুপারিশকৃত পদক্ষেপ' : 'Recommended Action'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xs font-bold text-emerald-950 leading-tight">
            {language === 'bn'
              ? 'ফসল কাটার পূর্বেই ক্রেতাদের সন্ধান সম্পন্ন করুন।'
              : 'Find buyers before harvest & schedule collection.'}
          </div>
          <p className="text-[11px] text-emerald-800/80">
            {language === 'bn' ? 'যৌথ পরিবহনে বুকিং নিশ্চিত করুন' : 'Lock in shared pickup vehicle'}
          </p>
        </Card>
      </div>

      {/* Accordion: Why This Recommendation? */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setIsWhyOpen(!isWhyOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-800" />
            <span className="font-bold text-sm text-slate-900">
              {language === 'bn' ? 'কেন এই পরামর্শ?' : 'Why this recommendation?'}
            </span>
          </div>
          {isWhyOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isWhyOpen && (
          <div className="px-5 pb-5 pt-1 space-y-3 text-xs text-slate-600 border-t border-slate-100">
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-700 font-bold">•</span>
              <div>
                <strong className="text-slate-800 font-bold">
                  {language === 'bn' ? 'প্রত্যাশিত চাহিদা:' : 'Expected Demand:'}
                </strong>{' '}
                {language === 'bn'
                  ? 'গত ৩ দিনে পাইকারি ক্রেতাদের অনুসন্ধানের পরিমাণ ২৪% বৃদ্ধি পেয়েছে।'
                  : 'Regional buyer demand inquiries for this crop are up 24% over past 72 hours.'}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-emerald-700 font-bold">•</span>
              <div>
                <strong className="text-slate-800 font-bold">
                  {language === 'bn' ? 'উপলব্ধ পরিমাণ:' : 'Available Quantity:'}
                </strong>{' '}
                {language === 'bn'
                  ? `আপনার ${quantity} কেজি পরিমাণ মিনি-পিকআপ ভ্যানের যৌথ ধারণক্ষমতার উপযুক্ত।`
                  : `Your ${quantity} kg volume fits standard city mini-van capacity without empty space.`}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-emerald-700 font-bold">•</span>
              <div>
                <strong className="text-slate-800 font-bold">
                  {language === 'bn' ? 'ফসল তোলার সময়:' : 'Harvest Timing:'}
                </strong>{' '}
                {language === 'bn'
                  ? 'গ্রেড এ মানের ফসল তোলার পর ৪-৫ দিন সম্পূর্ণ তাজা অবস্থায় সেরা দর পাওয়া যায়।'
                  : 'Grade A classification ensures top pricing for 4-5 days post-harvest.'}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-emerald-700 font-bold">•</span>
              <div>
                <strong className="text-slate-800 font-bold">
                  {language === 'bn' ? 'ক্রেতার দূরত্ব:' : 'Distance to Buyers:'}
                </strong>{' '}
                {language === 'bn'
                  ? 'দক্ষিণ ২৪ পরগনা থেকে কলকাতার দূরত্ব কম হওয়ায় পরিবহন খরচ минималь।'
                  : 'Short transit distance from South 24 Parganas to Kolkata wholesale hubs lowers logistics cost.'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation & Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          onClick={() => onNavigate('farmer-sell')}
          className="w-full sm:w-1/3 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'পিছনে যান' : 'Back / Adjust'}</span>
        </button>

        <button
          onClick={handlePublishFromAdvisor}
          className="w-full sm:w-2/3 py-3.5 px-6 rounded-xl bg-[#0F3E26] hover:bg-[#165636] active:scale-[0.98] text-white font-extrabold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>{language === 'bn' ? 'বিক্রি পরিকল্পনা গ্রহণ করুন' : 'Proceed with Selling Plan'}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
