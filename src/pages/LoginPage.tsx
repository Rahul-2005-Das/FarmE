import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { UserRole } from '../types';
import { Phone, KeyRound, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import farmLandscapeImg from '../assets/farm_landscape.jpg';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { BrandLogo } from '../components/ui/BrandLogo';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { loginWithDemoOtp } = useAuth();
  const { t, language } = useTranslation();

  const [mobile, setMobile] = useState('9830123456');
  const [otp, setOtp] = useState('123456');
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    const preferredRole = localStorage.getItem('krishok_bandhu_login_role');
    return preferredRole === 'buyer' || preferredRole === 'fleet' || preferredRole === 'admin' ? preferredRole : 'farmer';
  });
  const [error, setError] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!mobile || mobile.length < 10) {
      setError(t("auth.invalidMobileError"));
      return;
    }

    const res = loginWithDemoOtp(mobile, otp, selectedRole);
    if (res.success) {
      localStorage.removeItem('krishok_bandhu_login_role');
      if (selectedRole === 'farmer') onNavigate('farmer-dashboard');
      else if (selectedRole === 'buyer') onNavigate('buyer-dashboard');
      else if (selectedRole === 'fleet') onNavigate('fleet-dashboard');
      else onNavigate('admin-dashboard');
    } else {
      setError(t(res.error || "auth.invalidOtpError"));
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-stretch bg-white">
      {/* LEFT SPLIT: LUSH GREEN FARM LANDSCAPE & QUOTE (Hidden on mobile, visible on lg) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0A291A]">
        <img
          src={farmLandscapeImg}
          alt="Agricultural Farmland"
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A291A]/90 via-[#0A291A]/30 to-[#0A291A]/60" />

        <div className="relative z-10 p-12 flex flex-col justify-between text-white w-full">
          {/* Top Logo */}
          <BrandLogo />

          {/* Inspirational Quote */}
          <div className="space-y-4 max-w-md">
            <div className="w-12 h-1 bg-emerald-400 rounded-full" />
            <h2 className="text-3xl font-extrabold tracking-tight leading-snug">
              {language === 'bn'
                ? '“একসাথে গড়ি শক্তিশালী কৃষি বাজার”'
                : language === 'hi'
                  ? '“मिलकर एक मजबूत कृषि बाजार बनाएं।”'
                  : '“Together, let’s build a stronger agricultural marketplace.”'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed font-normal">
              {language === 'bn'
                ? 'কৃষকের উৎপাদিত ফসলের ন্যায্য মূল্যায়ন এবং পাইকারি ক্রেতাদের নির্ভরযোগ্য সরাসরি সরবরাহ।'
                : language === 'hi'
                  ? 'किसानों को उचित मूल्य और सत्यापित खरीदारों तक सीधी, पारदर्शी आपूर्ति उपलब्ध कराना।'
                  : 'Empowering farmers with fair pricing and providing verified buyers direct, transparent farm supply.'}
            </p>
          </div>

          <div className="text-xs text-emerald-300/70 font-medium">
            FarmE • National Farm-to-Market Network
          </div>
        </div>
      </div>

      {/* RIGHT SPLIT: MODERN LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-6 text-left">
          {/* Top Row with Back to Home & Language */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'হোমে ফিরে যান' : language === 'hi' ? 'होम पर वापस जाएँ' : 'Back to Home'}</span>
            </button>

            <LanguageSelector variant="compact" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {language === 'bn' ? 'লগইন করুন' : language === 'hi' ? 'अपने खाते में लॉगिन करें' : 'Login to Your Account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'bn' ? 'আপনার মোবাইল নম্বর দিয়ে সরাসরি প্রবেশ করুন' : language === 'hi' ? 'अपना मोबाइल नंबर दर्ज करें और साइन इन करें' : 'Enter your mobile number to sign in'}
            </p>
          </div>

          {/* Demo OTP Pill */}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <span className="font-semibold">
              {language === 'bn' ? 'টেস্ট ওটিপি: ১২৩৪৫৬' : language === 'hi' ? 'टेस्ट OTP: 123456' : 'Access OTP: 123456'}
            </span>
            <span className="text-[11px] bg-emerald-200/70 text-emerald-850 px-2 py-0.5 rounded-md font-bold">
              {language === 'bn' ? 'স্বয়ংক্রিয়' : language === 'hi' ? 'तुरंत डेमो' : 'Instant Demo'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {language === 'bn' ? 'ব্যবহারকারী নির্বাচন করুন' : language === 'hi' ? 'उपयोगकर्ता का चयन करें' : 'Select User Role'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('farmer')}
                  className={`py-2 px-2.5 rounded-xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    selectedRole === 'farmer'
                      ? 'border-[#0F3E26] bg-emerald-50/80 text-emerald-950 font-extrabold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">👨🌾</span>
                  <span>{language === 'bn' ? 'কৃষক' : language === 'hi' ? 'किसान' : 'Farmer'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('fleet')}
                  className={`py-2 px-2.5 rounded-xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${selectedRole === 'fleet' ? 'border-amber-700 bg-amber-50 text-amber-950 shadow-2xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="text-base">🚚</span>
                  <span>Fleet Driver</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('buyer')}
                  className={`py-2 px-2.5 rounded-xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    selectedRole === 'buyer'
                      ? 'border-[#0F3E26] bg-emerald-50/80 text-emerald-950 font-extrabold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">🛒</span>
                  <span>{language === 'bn' ? 'ক্রেতা' : language === 'hi' ? 'खरीदार' : 'Buyer'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    selectedRole === 'admin'
                      ? 'border-slate-800 bg-slate-100 text-slate-900 font-bold'
                      : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">🏛️</span>
                  <span>{language === 'bn' ? 'প্রশাসন' : language === 'hi' ? 'प्रशासन' : 'Admin'}</span>
                </button>
              </div>
            </div>

            {/* Mobile Number Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                {language === 'bn' ? 'মোবাইল নম্বর' : language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder={language === 'bn' ? '৯৮৩০১২৩৪৫৬' : language === 'hi' ? '9830123456' : '9830123456'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm font-medium outline-hidden"
                  required
                />
              </div>
            </div>

            {/* OTP Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                {language === 'bn' ? 'ওটিপি লিখুন' : language === 'hi' ? 'OTP दर्ज करें' : 'Enter OTP'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showOtp ? 'text' : 'password'}
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm font-medium outline-hidden"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOtp(!showOtp)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showOtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#0F3E26] hover:bg-[#165636] active:scale-[0.98] text-white font-bold text-sm shadow-sm transition-all cursor-pointer mt-2"
            >
              {language === 'bn' ? 'লগইন করুন' : language === 'hi' ? 'लॉगिन' : 'Login'}
            </button>
          </form>

          {/* Registration Redirect Link */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-600">
              {language === 'bn' ? 'নতুন ব্যবহারকারী?' : language === 'hi' ? 'क्या आप नए हैं?' : 'New here?'}{' '}
              <button
                onClick={() => onNavigate('register')}
                className="font-bold text-emerald-850 hover:underline cursor-pointer ml-1"
              >
                {language === 'bn' ? 'নিবন্ধন করুন' : language === 'hi' ? 'खाता बनाएं' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
