import React, { useState } from 'react';
import { ChevronDown, LogOut, User as UserIcon, LogIn, ArrowLeftRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  onNavigate: (route: string, options?: { replace?: boolean }) => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentRoute }) => {
  const { currentUser, currentRole, switchRole, logout } = useAuth();
  const { t, language } = useTranslation();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide top header on desktop if user is on a full dashboard view (since Sidebar is active on desktop)
  const isDashboardView = [
    'farmer-dashboard',
    'buyer-dashboard',
    'admin-dashboard',
    'farmer-sell',
    'farmer-ai-advisor',
    'farmer-matched-buyers',
    'buyer-find-produce',
    'admin-supply-demand',
    'logistics',
    'farmer-logistics',
    'buyer-shipments',
    'admin-logistics',
    'emergency-market',
    'farmer-emergency',
    'admin-emergency',
    'fleet-dashboard',
    'fleet-shipments',
    'fleet-active-delivery',
    'fleet-route',
    'fleet-history',
    'fleet-emergency',
    'fleet-profile',
  ].includes(currentRoute);

  return (
    <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs ${isDashboardView ? 'lg:hidden' : ''}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => {
            if (currentRole === 'farmer') onNavigate('farmer-dashboard');
            else if (currentRole === 'buyer') onNavigate('buyer-dashboard');
            else if (currentRole === 'fleet') onNavigate('fleet-dashboard');
            else if (currentRole === 'admin') onNavigate('admin-dashboard');
            else onNavigate('landing');
          }}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <BrandLogo compact />
          <div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {language === 'bn' ? 'জাতীয় কৃষি সমন্বয় প্ল্যাটফর্ম' : language === 'hi' ? 'राष्ट्रीय कृषि समन्वय मंच' : 'National Farm-to-Market Network'}
            </p>
          </div>
        </div>

        {/* MIDDLE NAV LINKS: Public Landing Navigation */}
        {currentRoute === 'landing' && (
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => onNavigate('landing')}
              className="text-emerald-850 font-bold hover:text-emerald-900 transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'হোম' : language === 'hi' ? 'होम' : 'Home'}
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'কীভাবে কাজ করে' : language === 'hi' ? 'यह कैसे काम करता है' : 'How It Works'}
            </button>
            <button
              onClick={() => onNavigate('role-select')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'সুবিধা' : language === 'hi' ? 'किसानों के लिए' : 'For Farmers'}
            </button>
            <button
              onClick={() => onNavigate('role-select')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'ক্রেতা' : language === 'hi' ? 'खरीदारों के लिए' : 'For Buyers'}
            </button>
          </nav>
        )}

        {/* RIGHT CONTROLS: Language & Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LanguageSelector variant="compact" />

          {/* If Logged In: Role Switcher / Profile Shortcut */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 min-h-[38px] cursor-pointer border border-slate-200/80"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-850 shrink-0" />
                <span className="font-bold text-slate-900 capitalize hidden sm:inline">
                  {currentRole === 'farmer' ? `👨🌾 ${language === 'bn' ? 'কৃষক' : language === 'hi' ? 'किसान' : 'Farmer'}` : currentRole === 'buyer' ? `🛒 ${language === 'bn' ? 'ক্রেতা' : language === 'hi' ? 'खरीदार' : 'Buyer'}` : currentRole === 'fleet' ? `🚚 Fleet` : `🏛️ ${language === 'bn' ? 'প্রশাসন' : language === 'hi' ? 'प्रशासन' : 'Admin'}`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsRoleMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 text-left animate-in fade-in duration-100">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      {language === 'bn' ? 'ভূমিকা পরিবর্তন' : language === 'hi' ? 'भूमिका बदलें' : 'Switch Role'}
                    </div>

                    <button
                      onClick={() => {
                        switchRole('farmer');
                        setIsRoleMenuOpen(false);
                        onNavigate('farmer-dashboard');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 rounded-xl cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span>👨🌾</span>
                        <span>{language === 'bn' ? 'কৃষক পোর্টাল' : language === 'hi' ? 'किसान पोर्टल' : 'Farmer Portal'}</span>
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        switchRole('buyer');
                        setIsRoleMenuOpen(false);
                        onNavigate('buyer-dashboard');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-950 rounded-xl cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span>🛒</span>
                        <span>{language === 'bn' ? 'ক্রেতা পোর্টাল' : language === 'hi' ? 'खरीदार पोर्टल' : 'Buyer Portal'}</span>
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        switchRole('fleet');
                        setIsRoleMenuOpen(false);
                        onNavigate('fleet-dashboard');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-950 rounded-xl cursor-pointer"
                    >
                      <span className="flex items-center gap-2"><span>🚚</span><span>Fleet Driver</span></span>
                    </button>

                    <button
                      onClick={() => {
                        switchRole('admin');
                        setIsRoleMenuOpen(false);
                        onNavigate('admin-dashboard');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span>🏛️</span>
                        <span>{language === 'bn' ? 'প্রশাসন কেন্দ্র' : language === 'hi' ? 'प्रशासन पोर्टल' : 'Admin Portal'}</span>
                      </span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setIsRoleMenuOpen(false);
                        onNavigate('login', { replace: true });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'লগআউট' : language === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* If Not Logged In: Login & Register Buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-emerald-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'লগইন' : language === 'hi' ? 'लॉगिन' : 'Login'}
              </button>

              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 text-xs font-bold bg-[#0F3E26] hover:bg-[#165636] active:scale-95 text-white rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                {language === 'bn' ? 'নিবন্ধন' : language === 'hi' ? 'रजिस्टर' : 'Register'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
