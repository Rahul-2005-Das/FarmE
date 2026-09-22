import React from 'react';
import {
  ArrowDown,
  CheckCircle2,
  TrendingUp,
  Users,
  Truck,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  MapPin,
  Clock,
  DollarSign,
  Layers,
  Bot
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useTranslation } from '../context/LanguageContext';
import farmerHeroImg from '../assets/farmer_hero.jpg';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t, language } = useTranslation();
  const handleFarmerClick = () => {
    localStorage.setItem('krishok_bandhu_login_role', 'farmer');
    onNavigate('login');
  };

  const handleBuyerClick = () => {
    localStorage.setItem('krishok_bandhu_login_role', 'buyer');
    onNavigate('login');
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 overflow-hidden">
      {/* ======================================================== */}
      {/* 1. HERO SECTION — BALANCED SPLIT LAYOUT */}
      {/* ======================================================== */}
      <section className="pt-6 sm:pt-12 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: Headline + Description + CTAs */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {language === 'bn'
                  ? 'জাতীয় খামার-থেকে-বাজার সমন্বয় প্ল্যাটফর্ম'
                  : language === 'hi'
                    ? 'राष्ट्रीय खेत-से-बाजार समन्वय मंच'
                    : 'National Farm-to-Market Network'}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              {language === 'bn' ? (
                <>
                  কৃষকের ফসল <br />
                  <span className="text-emerald-850 text-emerald-800">সরাসরি বাজারে</span>
                </>
              ) : language === 'hi' ? (
                <>
                  खेत से बाजार, <br />
                  <span className="text-emerald-850 text-emerald-800">और अधिक स्मार्ट।</span>
                </>
              ) : (
                <>
                  From Farm to Market, <br />
                  <span className="text-emerald-850 text-emerald-800">Smarter.</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              {language === 'bn'
                ? 'AI-powered প্ল্যাটফর্ম যা কৃষকদের সাহায্য করে ভালো বাজার খুঁজে পেতে, ক্রেতার সাথে সরাসরি যুক্ত হতে এবং পরিবহন সহজ করতে।'
                : language === 'hi'
                  ? 'एआई-संचालित मंच जो किसानों को सीधे खरीदारों से जोड़ता है और मांग, मूल्य और लॉजिस्टिक्स को स्मार्ट बनाता है।'
                  : 'An AI-powered platform connecting farmers directly with buyers while making demand, pricing and logistics smarter.'}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={handleFarmerClick}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0F3E26] hover:bg-[#165636] active:scale-[0.98] text-white font-bold text-base shadow-sm transition-all cursor-pointer border border-[#0B301D]"
              >
                <span>👤</span>
                <span>{language === 'bn' ? 'আমি কৃষক' : language === 'hi' ? 'मैं किसान हूँ' : 'Continue as Farmer'}</span>
              </button>

              <button
                onClick={handleBuyerClick}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50/70 active:scale-[0.98] text-emerald-900 font-bold text-base shadow-2xs transition-all cursor-pointer border-2 border-emerald-700"
              >
                <span>🛒</span>
                <span>{language === 'bn' ? 'আমি ক্রেতা' : language === 'hi' ? 'मैं खरीदार हूँ' : 'Continue as Buyer'}</span>
              </button>
            </div>

            {/* Small Secondary Sub-links */}
            <div className="flex items-center gap-5 text-xs text-slate-500 font-medium pt-1">
              <button
                onClick={() => onNavigate('login')}
                className="hover:text-emerald-850 font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <span>👤</span>
                <span className="underline underline-offset-2">{language === 'bn' ? 'লগইন' : language === 'hi' ? 'लॉगिन' : 'Login'}</span>
              </button>
              <span>•</span>
              <button
                onClick={() => onNavigate('register')}
                className="hover:text-emerald-850 font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <span>📝</span>
                <span className="underline underline-offset-2">{language === 'bn' ? 'নিবন্ধন করুন' : language === 'hi' ? 'खाता बनाएं' : 'Register'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Farmer Visual + Vertical Flow Diagram */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Main Farmer Photography Card */}
            <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-100 aspect-[4/3] sm:aspect-auto sm:h-[400px]">
              <img
                src={farmerHeroImg}
                alt="FarmE Farmer"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-semibold bg-black/40 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/20">
                🌱 {language === 'bn' ? 'সরাসরি খামার থেকে তাজা ফসল' : 'Fresh Produce Direct from Farm'}
              </div>
            </div>

            {/* Vertical Flow Diagram Badge (Subtle, matching reference collage) */}
            <div className="absolute -bottom-6 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl border border-emerald-200/80 text-[11px] font-bold text-slate-800 space-y-1.5 select-none w-36 sm:w-40 z-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="flex items-center gap-1.5 text-emerald-850">
                <span className="text-sm">🌾</span>
                <span>{language === 'bn' ? 'কৃষক' : language === 'hi' ? 'किसान' : 'Farmer'}</span>
              </div>
              <div className="text-center text-slate-400 text-[10px] leading-none">↓</div>

              <div className="flex items-center gap-1.5 text-purple-700">
                <span className="text-sm">🤖</span>
                <span>{language === 'bn' ? 'AI বিশ্লেষণ' : language === 'hi' ? 'AI विश्लेषण' : 'AI Intelligence'}</span>
              </div>
              <div className="text-center text-slate-400 text-[10px] leading-none">↓</div>

              <div className="flex items-center gap-1.5 text-blue-700">
                <span className="text-sm">🛒</span>
                <span>{language === 'bn' ? 'ক্রেতা' : language === 'hi' ? 'खरीदार' : 'Buyer'}</span>
              </div>
              <div className="text-center text-slate-400 text-[10px] leading-none">↓</div>

              <div className="flex items-center gap-1.5 text-amber-700">
                <span className="text-sm">🚚</span>
                <span>{language === 'bn' ? 'স্মার্ট লজিস্টিক্স' : language === 'hi' ? 'स्मार्ट लॉजिस्टिक्स' : 'Smart Logistics'}</span>
              </div>
              <div className="text-center text-slate-400 text-[10px] leading-none">↓</div>

              <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold">
                <span className="text-sm">🏛️</span>
                <span>{language === 'bn' ? 'বাজার' : language === 'hi' ? 'बाज़ार' : 'Market'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. VALUE STRIP (Immediately below Hero) */}
      {/* ======================================================== */}
      <section className="px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                {language === 'bn' ? 'ন্যায্য দাম' : 'Better Farmer Price'}
              </div>
              <div className="text-[11px] text-slate-500">
                {language === 'bn' ? 'মধ্যস্বত্বভোগী ছাড়া' : 'Direct pricing'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                {language === 'bn' ? 'সরাসরি বাজার প্রবেশ' : 'Direct Market Access'}
              </div>
              <div className="text-[11px] text-slate-500">
                {language === 'bn' ? 'যাচাইকৃত ক্রেতা' : 'Verified buyers'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                {language === 'bn' ? 'এআই চাহিদা বিশ্লেষণ' : 'AI Demand Intelligence'}
              </div>
              <div className="text-[11px] text-slate-500">
                {language === 'bn' ? 'সঠিক সিদ্ধান্ত' : 'Predictive demand'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                {language === 'bn' ? 'স্মার্ট পরিবহন' : 'Smart Logistics'}
              </div>
              <div className="text-[11px] text-slate-500">
                {language === 'bn' ? 'কম খরচে পিকআপ' : 'Optimized routes'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. HOW IT WORKS (Simple 4-Step Process) */}
      {/* ======================================================== */}
      <section id="how-it-works" className="px-4 max-w-6xl mx-auto text-left">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            {language === 'bn' ? 'সহজ চার ধাপ' : 'Simple 4 Steps'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === 'bn' ? 'কীভাবে কাজ করে প্ল্যাটফর্ম' : 'How the Platform Works'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {language === 'bn'
              ? 'কৃষক থেকে ক্রেতা পর্যন্ত প্রতিটি ধাপ সম্পূর্ণ স্বচ্ছ ও প্রযুক্তি-চালিত।'
              : 'Every step from harvest to collection is seamless, direct and transparent.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 relative">
            <span className="text-3xl font-extrabold text-emerald-200 block font-mono">01</span>
            <h3 className="font-bold text-base text-slate-900">
              {language === 'bn' ? 'ফসল তালিকাভুক্ত করুন' : 'Farmer Lists Produce'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'bn'
                ? 'ভয়েস বা সাধারণ ক্লিকের মাধ্যমে ফসলের নাম, পরিমাণ এবং আনুমানিক তোলার দিন জানান।'
                : 'Simple guided voice or touch flow to specify crop, quantity and harvest date.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 relative">
            <span className="text-3xl font-extrabold text-purple-200 block font-mono">02</span>
            <h3 className="font-bold text-base text-slate-900">
              {language === 'bn' ? 'এআই চাহিদা বোঝে' : 'AI Understands Demand'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'bn'
                ? 'আঞ্চলিক পাইকারি চাহিদা ও মান্ডি দর বিশ্লেষণ করে সঠিক মূল্য ও কৌশল তৈরি করে।'
                : 'Analyzes wholesale arrivals and regional demand to recommend optimal pricing.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 relative">
            <span className="text-3xl font-extrabold text-blue-200 block font-mono">03</span>
            <h3 className="font-bold text-base text-slate-900">
              {language === 'bn' ? 'ক্রেতা ম্যাচিং সম্পন্ন' : 'Platform Matches Buyers'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'bn'
                ? 'যাচাইকৃত খুচরা বিক্রেতা ও পাইকারদের সাথে ফসল কাটার আগেই সরাসরি চুক্তি নিশ্চিত হয়।'
                : 'Connects with verified retailers and wholesalers before harvest to secure pre-orders.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 relative">
            <span className="text-3xl font-extrabold text-amber-200 block font-mono">04</span>
            <h3 className="font-bold text-base text-slate-900">
              {language === 'bn' ? 'স্মার্ট লজিস্টিক্সে ডেলিভারি' : 'Smart Logistics Delivers'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'bn'
                ? 'কাছাকাছি কৃষকদের ফসল একত্রিত করে যৌথ যানে কম খরচে নির্দিষ্ট গন্তব্যে পৌঁছায়।'
                : 'Aggregates nearby farm batches into shared transport to lower transport cost.'}
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. ROLE ENTRY (Who Are You?) */}
      {/* ======================================================== */}
      <section className="px-4 max-w-4xl mx-auto">
        <div className="text-center mb-8 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {language === 'bn' ? 'আপনি কোন হিসেবে যুক্ত হতে চান?' : 'Who Are You?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'bn' ? 'আপনার ভূমিকা নির্বাচন করে সরাসরি প্রবেশ করুন।' : 'Select your role to explore tailored features.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Card 1: Farmer */}
          <div
            onClick={handleFarmerClick}
            className="p-6 rounded-3xl bg-emerald-50/50 border-2 border-emerald-300 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer text-left space-y-4 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
              🌾
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                {language === 'bn' ? 'কৃষক ও এফপিও' : 'FARMER / FPO'}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {language === 'bn' ? 'ফসল বিক্রি করুন সরাসরি' : 'Sell Produce Directly'}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {language === 'bn'
                  ? 'মধ্যস্বত্বভোগী ছাড়া সঠিক দামে ফসল বিক্রি করুন এবং এআই-এর সহায়তায় সেরা পরামর্শ পান।'
                  : 'Sell produce directly and get smarter market recommendations with zero middlemen.'}
              </p>
            </div>
            <button type="button" onClick={handleFarmerClick} className="w-full py-2.5 rounded-xl bg-[#0F3E26] text-white font-bold text-xs flex items-center justify-center gap-2 group-hover:bg-[#165636] transition-colors">
              <span>{language === 'bn' ? 'আমি কৃষক হিসেবে এগিয়ে যাব' : 'Continue as Farmer'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Buyer */}
          <div
            onClick={handleBuyerClick}
            className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-300 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer text-left space-y-4 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
              🛒
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-1">
                {language === 'bn' ? 'পাইকার ও ব্যবসায়ী' : 'BUYER / ENTERPRISE'}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {language === 'bn' ? 'তাজা ফসল সংগ্রহ করুন' : 'Source Verified Produce'}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {language === 'bn'
                  ? 'সরাসরি নির্ভরযোগ্য কৃষকদের থেকে মানসম্পন্ন ফসল সন্ধান ও পাইকারি সরবরাহ নিশ্চিত করুন।'
                  : 'Find verified produce directly from farmers with transparent pricing and scheduled delivery.'}
              </p>
            </div>
            <button type="button" onClick={handleBuyerClick} className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 group-hover:bg-slate-800 transition-colors">
              <span>{language === 'bn' ? 'আমি ক্রেতা হিসেবে এগিয়ে যাব' : 'Continue as Buyer'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. MINIMAL TRUST FOOTER */}
      {/* ======================================================== */}
      <footer className="pt-8 border-t border-slate-200 px-4 max-w-6xl mx-auto text-xs text-slate-500 text-center space-y-2">
        <p className="font-semibold text-slate-700">
          🌾 FarmE • {language === 'bn' ? 'জাতীয় কৃষি সমন্বয় নেটওয়ার্ক' : 'National Farm-to-Market Coordination Platform'}
        </p>
        <p>
          {language === 'bn'
            ? 'গ্রামীণ কৃষকদের সহজে ব্যবহারের জন্য উচ্চ বৈসাদৃশ্য, বহুভাষিক ভয়েস ইনপুট এবং লাইভ মান্ডি দরের সমন্বয়ে তৈরি।'
            : 'Designed for accessibility, high contrast, and direct farm-to-buyer coordination.'}
        </p>
      </footer>
    </div>
  );
};
