import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Sidebar } from '../components/ui/Sidebar';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import {
  DEMO_ORDERS,
  DEMO_MARKET_PRICES,
} from '../data/mockData';
import {
  TrendingUp,
  ClipboardList,
  Sparkles,
  Truck,
  HelpCircle,
  Mic,
  ArrowRight,
} from 'lucide-react';
import { getOrdersForFarmer, loadFarmerListings } from '../services/storage';

interface FarmerDashboardProps {
  onNavigate: (route: string) => void;
  activeSubView?: string;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ onNavigate, activeSubView }) => {
  const { currentUser } = useAuth();
  const { language } = useTranslation();

  // Active modal controls
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const farmerName = currentUser?.name || 'Ramesh Mondal';
  const farmerDistrict = (currentUser as { district?: string })?.district || 'South 24 Parganas';

  const farmerOrders = getOrdersForFarmer(currentUser?.id || 'f-101');
  const fallbackOrders = currentUser?.id === 'f-101'
    ? DEMO_ORDERS.filter((order) => order.farmerId === 'f-101')
    : [];
  const visibleFarmerOrders = farmerOrders.length ? farmerOrders : fallbackOrders;
  const visibleListings = loadFarmerListings().filter(
    (listing) => listing.farmerId === (currentUser?.id || 'f-101')
  );

  if (activeSubView) {
    const viewTitle = activeSubView === 'crops'
      ? (language === 'bn' ? 'আমার ফসল তালিকা' : language === 'hi' ? 'मेरी फसल सूची' : 'My Produce Listings')
      : activeSubView === 'orders'
      ? (language === 'bn' ? 'আমার অর্ডারসমূহ' : language === 'hi' ? 'मेरे ऑर्डर' : 'My Orders')
      : (language === 'bn' ? 'কৃষক পরামর্শ' : language === 'hi' ? 'किसान सलाह' : 'Farmer Advice');

    return (
      <div className="flex min-h-[calc(100vh-64px)] bg-[#F8FAF8] text-slate-800">
        <Sidebar currentRoute={`farmer-${activeSubView}`} onNavigate={onNavigate} />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 space-y-5 text-left pb-24">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                {language === 'bn' ? 'কৃষক পোর্টাল' : language === 'hi' ? 'किसान पोर्टल' : 'Farmer Portal'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{viewTitle}</h1>
            </div>
            <LanguageSelector variant="compact" />
          </div>

          {activeSubView === 'crops' && (
            <>
              <div className="flex justify-end"><Button variant="farmer" size="sm" onClick={() => onNavigate('farmer-sell')}>{language === 'bn' ? 'নতুন ফসল যোগ করুন' : language === 'hi' ? 'नई फसल जोड़ें' : 'Create Listing'}</Button></div>
              {visibleListings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{language === 'bn' ? 'এখনও কোনো সংরক্ষিত ফসল তালিকা নেই।' : language === 'hi' ? 'अभी तक कोई सहेजी गई फसल सूची नहीं है।' : 'No saved produce listings yet.'}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{visibleListings.map((listing) => <div key={listing.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2"><div className="flex justify-between gap-3"><h2 className="font-extrabold text-slate-900">{listing.crop}</h2><span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-full">{listing.status}</span></div><p className="text-sm text-slate-600">{listing.quantity} kg · {listing.grade} · ₹{listing.expectedPrice}/kg</p><p className="text-xs text-slate-500">{listing.location.village}, {listing.location.district} · {listing.harvestDate}</p></div>)}</div>
              )}
            </>
          )}

          {activeSubView === 'orders' && (
            <div className="space-y-3">{visibleFarmerOrders.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{language === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি।' : language === 'hi' ? 'कोई ऑर्डर नहीं मिला।' : 'No orders found.'}</div> : visibleFarmerOrders.map((order) => <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h2 className="font-extrabold text-slate-900">{order.cropNameEn} · {order.quantityKg} kg</h2><p className="text-xs text-slate-500 mt-1">{order.buyerName} · {order.deliveryDate}</p></div><div className="text-right"><p className="font-extrabold text-emerald-800">₹{order.totalAmount.toLocaleString('en-IN')}</p><span className="text-xs font-bold text-slate-600">{order.status}</span></div></div>)}</div>
          )}

          {activeSubView === 'advice' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => onNavigate('farmer-ai-advisor')} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left hover:border-emerald-500"><Sparkles className="w-6 h-6 text-emerald-700" /><h2 className="font-extrabold text-slate-900 mt-3">{language === 'bn' ? 'AI পরামর্শ' : language === 'hi' ? 'AI सलाह' : 'AI Advisor'}</h2></button>
              <button onClick={() => onNavigate('farmer-crop-recommendation')} className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left hover:border-blue-500"><TrendingUp className="w-6 h-6 text-blue-700" /><h2 className="font-extrabold text-slate-900 mt-3">{language === 'bn' ? 'ফসল সুপারিশ' : language === 'hi' ? 'फसल सिफारिश' : 'Crop Recommendation'}</h2></button>
              <button onClick={() => onNavigate('farmer-ai-copilot')} className="rounded-2xl border border-slate-300 bg-white p-5 text-left hover:border-slate-500"><Mic className="w-6 h-6 text-slate-700" /><h2 className="font-extrabold text-slate-900 mt-3">{language === 'bn' ? 'AI সহকারী' : language === 'hi' ? 'AI सहायक' : 'AI Copilot'}</h2></button>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#F8FAF8] text-slate-800">
      {/* 1. DESKTOP DEEP-GREEN SIDEBAR */}
      <Sidebar
        currentRoute="farmer-dashboard"
        onNavigate={onNavigate}
        onActionClick={(actionId) => setActiveModal(actionId)}
      />

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 max-w-6xl mx-auto space-y-6 text-left">
        {/* Top Bar for Dashboard */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              {language === 'bn' ? 'কৃষক ড্যাশবোর্ড' : 'Farmer Dashboard'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {language === 'bn' ? `নমস্কার, ${farmerName.split(' ')[0]} 👋` : `Hello, ${farmerName.split(' ')[0]} 👋`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'bn'
                ? 'আপনার ফসলের সেরা বাজার নিশ্চিত করতে আমরা প্রস্তুত।'
                : "Let's find the best market and pricing for your produce today."}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('farmer-ai-assistant')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
            >
              <Mic className="w-4 h-4 text-amber-300" />
              <span>
                {language === 'bn' ? 'FarmE AI' : language === 'hi' ? 'FarmE AI' : 'Ask AI'}
              </span>
            </button>

            <LanguageSelector variant="compact" />
          </div>
        </div>

        {/* AI Assistants Grid: Voice Assistant & Decision Copilot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Ask FarmE AI (Voice & Chat Assistant) */}
          <div
            onClick={() => onNavigate('farmer-ai-assistant')}
            className="p-5 rounded-2xl bg-gradient-to-br from-[#0F3E26] to-[#1b5e3a] text-white hover:shadow-md transition-all cursor-pointer space-y-2 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center">
                <Mic className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-bold text-amber-200 bg-white/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {language === 'bn' ? 'ভয়েস এআই' : language === 'hi' ? 'वॉयस एआई' : 'Voice AI'}
              </span>
            </div>
            <h3 className="font-bold text-base group-hover:text-amber-200 transition-colors">
              {language === 'bn' ? 'FarmE AI-কে জিজ্ঞাসা করুন' : language === 'hi' ? 'FarmE AI से पूछें' : 'Ask FarmE AI'}
            </h3>
            <p className="text-xs text-emerald-100/90">
              {language === 'bn'
                ? 'বাংলা, হিন্দি বা ইংরেজিতে কথা বলুন — ফসল, ক্রেতা, দাম ও জরুরি সহায়তা জানুন'
                : language === 'hi'
                ? 'हिंदी, बांग्ला या अंग्रेजी में बोलें — फसल, खरीदार, भाव व सहायता पाएं'
                : 'Speak in Bengali, Hindi, or English for crops, buyers, prices, and logistics'}
            </p>
          </div>

          {/* 2. AI Farm Decision Copilot */}
          <div
            onClick={() => onNavigate('farmer-ai-copilot')}
            className="p-5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-[11px] font-bold text-emerald-200 bg-white/10 px-2 py-0.5 rounded-md">
                {language === 'bn' ? 'সিদ্ধান্ত সহায়ক' : language === 'hi' ? 'निर्णय कॉपायलट' : 'Decision Copilot'}
              </span>
            </div>
            <h3 className="font-bold text-base group-hover:text-emerald-200 transition-colors">
              {language === 'bn' ? 'এআই কৃষক সিদ্ধান্ত সহায়ক' : language === 'hi' ? 'एआई फार्म कॉपायलट' : 'AI Farm Decision Copilot'}
            </h3>
            <p className="text-xs text-slate-300">
              {language === 'bn'
                ? 'কী চাষ করবেন, কোথায় বিক্রি করবেন, কীভাবে পাঠাবেন'
                : language === 'hi'
                ? 'क्या उगाएं, कहां बेचें और कैसे डिलीवर करें'
                : 'What to grow, where to sell, and how to deliver'}
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN HERO ACTION: SELL PRODUCE (Prominent Big Deep Green Card) */}
        {/* ======================================================== */}
        <div
          onClick={() => onNavigate('farmer-sell')}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0F3E26] via-[#144E31] to-[#0A291A] text-white shadow-md hover:shadow-xl transition-all cursor-pointer group select-none relative overflow-hidden"
        >
          {/* Subtle decorative background glow */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                🌾
              </div>
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-2.5 py-0.5 rounded-full mb-1.5">
                  {language === 'bn' ? 'প্রধান সেবা' : 'Primary Action'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {language === 'bn' ? 'ফসল বিক্রি করুন' : 'Sell Your Produce'}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-lg leading-relaxed">
                  {language === 'bn'
                    ? 'আপনার ফসলের নাম ও পরিমাণ বলুন। আমরা সরাসরি সেরা পাইকারি ক্রেতা ও যৌক্তিক দর খুঁজে দেব।'
                    : 'Tell us what you have. We’ll help you find the right market and verified buyers.'}
                </p>
              </div>
            </div>

            <button onClick={() => onNavigate('farmer-sell')} className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#0F3E26] hover:bg-emerald-50 active:scale-95 font-extrabold text-sm shadow-sm transition-transform shrink-0">
              <span>{language === 'bn' ? 'ফসল বিক্রি করুন' : 'Sell Produce'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5 COMPACT COMPANION ACTION CARDS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Today's Market Price */}
          <div
            onClick={() => setActiveModal('market-price')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-850 bg-emerald-50 px-2 py-0.5 rounded-md">
                ₹২৯–৩১ / কেজি
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-850 transition-colors">
                {language === 'bn' ? 'আজকের বাজার দর' : "Today's Market Price"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn' ? 'টমেটো ও প্রধান ফসলের পাইকারি দর' : 'Tomato & regional mandi benchmark'}
              </p>
            </div>
          </div>

          {/* 2. My Orders */}
          <div
            onClick={() => setActiveModal('my-orders')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
                {visibleFarmerOrders.length} {language === 'bn' ? 'অর্ডার সক্রিয়' : 'Active'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-800 transition-colors">
                {language === 'bn' ? 'আমার অর্ডার' : 'My Orders'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn' ? 'বর্তমান বিক্রির স্ট্যাটাস ও ইতিহাস' : 'Confirmed bookings & fulfillment'}
              </p>
            </div>
          </div>

          {/* 3. AI Farmer Advice */}
          <div
            onClick={() => onNavigate('farmer-ai-advisor')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-500 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-700" />
              </div>
              <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md">
                {language === 'bn' ? '৩টি পরামর্শ' : '3 Advice Ready'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-purple-800 transition-colors">
                {language === 'bn' ? 'AI পরামর্শ' : 'AI Farmer Advice'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn' ? 'চাহিদা অনুযায়ী সঠিক বিক্রয় কৌশল' : 'Smart selling strategy & timing'}
              </p>
            </div>
          </div>

          {/* 3b. Crop-to-Market Recommendation */}
          <div
            onClick={() => onNavigate('farmer-crop-recommendation')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-700" />
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                {language === 'bn' ? 'নতুন' : 'New'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-800 transition-colors">
                {language === 'bn' ? 'ফসল-থেকে-বাজার সুপারিশ' : 'Crop-to-Market Recommendation'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn' ? 'কি গাছাই, কোন বাজার, কে কিনবে, কীভাবে পাঠানো হবে' : 'What to grow, where demand exists, who will buy, and how to move it'}
              </p>
            </div>
          </div>

          {/* 4. Delivery / Logistics */}
          <div
            onClick={() => setActiveModal('delivery')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                {language === 'bn' ? '২টি নির্ধারিত' : '2 Scheduled'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-800 transition-colors">
                {language === 'bn' ? 'ডেলিভারি ট্র্যাকিং' : 'Delivery Tracking'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn' ? 'যৌথ গাড়ি ও পিকআপ সময়সূচী' : 'Shared vehicle pickup schedule'}
              </p>
            </div>
          </div>

          {/* 5. Help & Support */}
          <div
            onClick={() => setActiveModal('help')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-rose-500 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">
                ১৮০০-১২৩-৪৫৬৭
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-rose-800 transition-colors">
                {language === 'bn' ? 'কৃষক সহায়তা' : 'Farmer Support'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn' ? 'সরাসরি বিশেষজ্ঞের সাথে কথা বলুন' : 'Toll-free agricultural help desk'}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM MOTIVATIONAL BANNER (Matching reference panel 4) */}
        {/* ======================================================== */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center text-lg shrink-0">
              🌾
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-950">
                {language === 'bn' ? 'কৃষকের পাশে, সব সময় — FarmE' : 'Always with our farmers — FarmE'}
              </h4>
              <p className="text-xs text-emerald-800/80">
                {language === 'bn'
                  ? 'ন্যায্য মূল্য, নিশ্চিত ক্রেতা এবং প্রযুক্তিগত সহায়তায় সমৃদ্ধ কৃষি।'
                  : 'Empowering farmers with direct markets, fair pricing, and AI guidance.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-900 bg-emerald-200/70 px-3 py-1.5 rounded-xl hidden sm:inline-block">
            {language === 'bn' ? 'সরাসরি সাহায্য' : 'Direct Support'}
          </span>
        </div>
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: MARKET PRICES */}
      {/* ======================================================== */}
      <Modal
        isOpen={activeModal === 'market-price'}
        onClose={() => setActiveModal(null)}
        title={language === 'bn' ? 'আজকের বাজার দর' : "Today's Market Prices"}
        maxWidth="lg"
      >
        <div className="space-y-4 text-left">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
            📍 {farmerDistrict} {language === 'bn' ? 'ও নিকটবর্তী মান্ডির বর্তমান পাইকারি দর' : 'and regional benchmark rates'}
          </div>

          <div className="space-y-2">
            {DEMO_MARKET_PRICES.map((mp, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {language === 'bn' ? mp.cropNameBn : mp.cropNameEn}
                  </h4>
                  <p className="text-xs text-slate-500">{mp.mandiName} • {mp.district}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-emerald-800">₹{mp.modalPrice} / {mp.unit}</div>
                  <div className="text-[11px] text-slate-400">সীমা: ₹{mp.minPrice} – ₹{mp.maxPrice}</div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="farmer" fullWidth onClick={() => setActiveModal(null)}>
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </Button>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: MY ORDERS */}
      {/* ======================================================== */}
      <Modal
        isOpen={activeModal === 'my-orders'}
        onClose={() => setActiveModal(null)}
        title={language === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Orders'}
        maxWidth="lg"
      >
        <div className="space-y-4 text-left">
          <div className="space-y-2.5">
            {farmerOrders.length > 0 ? (
              farmerOrders.map((ord) => (
                <div key={ord.id} className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-800">{ord.id}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                      {ord.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>{language === 'bn' ? ord.cropNameBn : ord.cropNameEn} ({ord.quantityKg} kg)</span>
                    <span className="text-emerald-800">₹{ord.totalAmount}</span>
                  </div>
                  <div className="text-xs text-slate-500 flex justify-between">
                    <span>ক্রেতা: {ord.buyerName}</span>
                    <span>ডেলিভারি: {ord.deliveryDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">
                {language === 'bn' ? 'কোনো সক্রিয় অর্ডার পাওয়া যায়নি।' : 'No active orders found.'}
              </p>
            )}
          </div>

          <Button variant="outline" fullWidth onClick={() => setActiveModal(null)}>
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </Button>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: DELIVERY */}
      {/* ======================================================== */}
      <Modal
        isOpen={activeModal === 'delivery'}
        onClose={() => setActiveModal(null)}
        title={language === 'bn' ? 'ডেলিভারি ট্র্যাকিং' : 'Delivery Tracking'}
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
            <h4 className="font-bold text-sm">🚚 {language === 'bn' ? 'যৌথ পরিবহন রুট সক্রিয়' : 'Shared Transport Active'}</h4>
            <p>{language === 'bn' ? 'আপনার এলাকার ৩ জন কৃষকের ফসল একই গাড়িতে নিয়ে যাওয়া হবে।' : 'Transport shared with 3 nearby farmers to reduce transit cost.'}</p>
          </div>

          <div className="p-3.5 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between font-bold text-slate-900">
              <span>যানবাহন: WB-29-A-8412</span>
              <span className="text-emerald-800">সময়সূচী: আগামীকাল সকাল ৭:৩০</span>
            </div>
            <p>চালক: সুব্রত কর্মকার (📞 ৯৮৩০০১১২২৩)</p>
            <p>পিকআপ স্থান: চম্পাহাটি বটতলা মোড়</p>
          </div>

          <Button variant="farmer" fullWidth onClick={() => onNavigate('farmer-logistics')}>
            {language === 'bn' ? 'ঠিক আছে' : 'OK'}
          </Button>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 4: HELP & SUPPORT */}
      {/* ======================================================== */}
      <Modal
        isOpen={activeModal === 'help'}
        onClose={() => setActiveModal(null)}
        title={language === 'bn' ? 'কৃষক সহায়তা কেন্দ্র' : 'Farmer Help & Support'}
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
            <h4 className="font-bold text-sm text-emerald-950">📞 {language === 'bn' ? 'টোল-ফ্রি হেল্পলাইন' : 'Toll-Free Helpline'}</h4>
            <p className="text-emerald-900 text-base font-extrabold">১৮০০-১২৩-৪৫৬৭</p>
            <p className="text-slate-600">{language === 'bn' ? 'সকাল ৮টা থেকে রাত ৮টা পর্যন্ত খোলা।' : 'Open daily 8:00 AM – 8:00 PM.'}</p>
          </div>

          <Button variant="farmer" fullWidth onClick={() => setActiveModal(null)}>
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
