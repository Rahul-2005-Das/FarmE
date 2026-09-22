import React from 'react';
import { Card } from '../components/ui/Card';
import { ArrowRight, UserCheck, ShoppingBag } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { BrandLogo } from '../components/ui/BrandLogo';
import { LanguageSelector } from '../components/ui/LanguageSelector';

interface RegisterSelectPageProps {
  onNavigate: (route: string) => void;
}

export const RegisterSelectPage: React.FC<RegisterSelectPageProps> = ({ onNavigate }) => {
  const { t, language } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 text-center">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between mb-8 max-w-lg mx-auto">
        <BrandLogo compact />
        <LanguageSelector variant="compact" />
      </div>

      <div className="mb-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {language === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : language === 'hi' ? 'नया खाता बनाएं' : 'Create New Account'}
        </h1>
        <p className="text-sm text-slate-600">
          {language === 'bn' ? 'আপনি কোন হিসেবে নিবন্ধন করতে চান?' : language === 'hi' ? 'आप किस रूप में पंजीकरण करना चाहते हैं?' : 'How would you like to register on the platform?'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-center max-w-lg mx-auto">
        {/* Farmer / FPO */}
        <div
          onClick={() => onNavigate('register-farmer')}
          className="p-6 rounded-3xl border-2 border-emerald-300 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50/80 transition-all cursor-pointer space-y-3 group shadow-2xs hover:shadow-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl mx-auto group-hover:scale-105 transition-transform">
            👨🌾
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            {language === 'bn' ? 'কৃষক / FPO' : language === 'hi' ? 'किसान / FPO' : 'Farmer / FPO'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'bn' ? 'আমি কৃষক বা কৃষক সংগঠনের সদস্য' : language === 'hi' ? 'मैं किसान या किसान उत्पादक संगठन का सदस्य हूं' : 'I am a farmer or member of a Farmer Producer Organization'}
          </p>
        </div>

        {/* Buyer */}
        <div
          onClick={() => onNavigate('register-buyer')}
          className="p-6 rounded-3xl border-2 border-slate-200 hover:border-blue-600 bg-white hover:bg-blue-50/20 transition-all cursor-pointer space-y-3 group shadow-2xs hover:shadow-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-3xl mx-auto group-hover:scale-105 transition-transform">
            🛒
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            {language === 'bn' ? 'ক্রেতা' : language === 'hi' ? 'खरीदार' : 'Buyer'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'bn' ? 'আমি ব্যবসায়ী / পাইকারি ক্রেতা' : language === 'hi' ? 'मैं व्यवसाय, खुदरा या थोक खरीदार हूं' : 'I am a business, retailer or wholesale buyer'}
          </p>
        </div>
      </div>

      <div className="mt-8 text-xs text-slate-500 space-y-2">
        <p>{language === 'bn' ? 'অথবা ইতিমধ্যে একাউন্ট আছে?' : language === 'hi' ? 'क्या आपका पहले से खाता है?' : 'Already have an account?'}</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-2.5 rounded-xl border border-slate-300 hover:border-emerald-600 text-slate-800 font-bold text-xs hover:bg-white transition-colors cursor-pointer"
        >
          {language === 'bn' ? 'লগইন করুন' : language === 'hi' ? 'यहां लॉगिन करें' : 'Login Here'}
        </button>
      </div>
    </div>
  );
};
