import React from 'react';
import { Home, Package, ClipboardList, Sparkles, User, PlusCircle, Truck, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { t, language } = useTranslation();
  const { currentRole } = useAuth();

  // Only show when authenticated or on dashboard/sell flows
  if (!currentRole) {
    return null;
  }

  if (currentRole === 'farmer') {
    return (
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-bottom shadow-lg"
        aria-label="Mobile Farmer Navigation"
      >
        <div className="grid grid-cols-7 h-16 items-center px-1">
          {/* 1. Home */}
          <button
            onClick={() => onSelectTab('farmer-dashboard')}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 cursor-pointer transition-colors ${
              currentTab === 'farmer-dashboard' ? 'text-emerald-900 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">{language === 'bn' ? 'হোম' : language === 'hi' ? 'होम' : 'Home'}</span>
          </button>

          {/* 2. Sell Produce (Prominent Center Button) */}
          <button
            onClick={() => onSelectTab('farmer-sell')}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 cursor-pointer transition-colors ${
              currentTab === 'farmer-sell' ? 'text-emerald-900 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-[#0F3E26] text-white flex items-center justify-center shadow-xs">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 font-bold text-emerald-950">{language === 'bn' ? 'বিক্রি' : language === 'hi' ? 'बेचें' : 'Sell'}</span>
          </button>

          {/* 3. Orders */}
          <button
            onClick={() => onSelectTab('farmer-orders')}
            className="flex flex-col items-center justify-center h-full min-h-[48px] py-1 cursor-pointer text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">{language === 'bn' ? 'অর্ডার' : language === 'hi' ? 'ऑर्डर' : 'Orders'}</span>
          </button>

          {/* 4. AI Advice */}
          <button
            onClick={() => onSelectTab('farmer-ai-advisor')}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 cursor-pointer transition-colors ${
              currentTab === 'farmer-ai-advisor' ? 'text-purple-900 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-5 h-5 text-purple-700" />
            <span className="text-[10px] mt-1 font-medium">{language === 'bn' ? 'AI পরামর্শ' : language === 'hi' ? 'AI सलाह' : 'AI Advice'}</span>
          </button>

          <button
            onClick={() => onSelectTab('farmer-logistics')}
            className="flex flex-col items-center justify-center h-full min-h-[48px] py-1 cursor-pointer text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Truck className="w-5 h-5 text-amber-700" />
            <span className="text-[10px] mt-1 font-medium">{language === 'bn' ? 'ডেলিভারি' : language === 'hi' ? 'डिलीवरी' : 'Delivery'}</span>
          </button>
          <button
            onClick={() => onSelectTab('farmer-emergency')}
            className="flex flex-col items-center justify-center h-full min-h-[48px] py-1 cursor-pointer text-slate-500 hover:text-slate-800 transition-colors"
          >
            <AlertTriangle className="w-5 h-5 text-rose-700" />
            <span className="text-[10px] mt-1 font-medium">{language === 'bn' ? 'জরুরি' : language === 'hi' ? 'आपातकाल' : 'Emergency'}</span>
          </button>

          {/* 5. Profile */}
          <button
            onClick={() => onSelectTab('profile')}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 cursor-pointer transition-colors ${
              currentTab === 'profile' ? 'text-emerald-900 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">{language === 'bn' ? 'প্রোফাইল' : language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}</span>
          </button>
        </div>
      </nav>
    );
  }

  if (currentRole === 'fleet') {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-bottom shadow-lg" aria-label="Mobile Fleet Navigation">
        <div className="grid grid-cols-4 h-16 items-center px-2">
          <button onClick={() => onSelectTab('fleet-dashboard')} className="flex flex-col items-center justify-center h-full text-slate-700"><Home className="w-5 h-5 text-amber-700" /><span className="text-[10px] mt-1">Home</span></button>
          <button onClick={() => onSelectTab('fleet-active-delivery')} className="flex flex-col items-center justify-center h-full text-slate-700"><Truck className="w-5 h-5 text-amber-700" /><span className="text-[10px] mt-1">Delivery</span></button>
          <button onClick={() => onSelectTab('fleet-route')} className="flex flex-col items-center justify-center h-full text-slate-700"><Package className="w-5 h-5 text-amber-700" /><span className="text-[10px] mt-1">Route</span></button>
          <button onClick={() => onSelectTab('fleet-profile')} className="flex flex-col items-center justify-center h-full text-slate-700"><User className="w-5 h-5" /><span className="text-[10px] mt-1">Profile</span></button>
        </div>
      </nav>
    );
  }

  // Buyer / Admin Mobile Nav
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-bottom shadow-lg"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-4 h-16 items-center px-2">
        <button
          onClick={() => onSelectTab(currentRole === 'buyer' ? 'buyer-dashboard' : 'admin-dashboard')}
          className="flex flex-col items-center justify-center h-full min-h-[48px] text-slate-700 font-medium"
        >
          <Home className="w-5 h-5 text-emerald-800" />
          <span className="text-[10px] mt-1">{language === 'bn' ? 'হোম' : language === 'hi' ? 'होम' : 'Home'}</span>
        </button>

        <button
          onClick={() => onSelectTab(currentRole === 'buyer' ? 'buyer-find-produce' : 'admin-supply-demand')}
          className="flex flex-col items-center justify-center h-full min-h-[48px] text-slate-700 font-medium"
        >
          <Package className="w-5 h-5 text-blue-700" />
          <span className="text-[10px] mt-1">{language === 'bn' ? 'ফসল' : language === 'hi' ? 'उत्पाद' : 'Produce'}</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className="flex flex-col items-center justify-center h-full min-h-[48px] text-slate-700 font-medium"
        >
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span className="text-[10px] mt-1">{language === 'bn' ? 'সেটিংস' : language === 'hi' ? 'सेटिंग्स' : 'Settings'}</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className="flex flex-col items-center justify-center h-full min-h-[48px] text-slate-700 font-medium"
        >
          <User className="w-5 h-5 text-slate-700" />
          <span className="text-[10px] mt-1">{language === 'bn' ? 'প্রোফাইল' : language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}</span>
        </button>
      </div>
    </nav>
  );
};
