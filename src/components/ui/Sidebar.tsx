import React from 'react';
import {
  Home,
  Package,
  TrendingUp,
  ClipboardList,
  Sparkles,
  Truck,
  HelpCircle,
  User,
  Settings,
  LogOut,
  Users,
  ShoppingBag,
  BarChart3,
  AlertTriangle,
  FileText,
  Search,
  Mic,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string, options?: { replace?: boolean }) => void;
  onActionClick?: (actionId: string) => void;
  fleetNav?: string[][];
  adminNav?: string[][];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  onActionClick
  , fleetNav = []
  , adminNav = []
}) => {
  const { currentUser, currentRole, logout } = useAuth();
  const { t, language } = useTranslation();

  const handleLogout = () => {
    logout();
    onNavigate('login', { replace: true });
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0F3E26] text-white min-h-screen shrink-0 sticky top-0 h-screen select-none border-r border-[#1B4E34]">
      {/* Brand Header */}
      <div
        onClick={() => onNavigate(currentRole ? `${currentRole}-dashboard` : 'landing')}
        className="p-5 flex items-center gap-3 cursor-pointer border-b border-[#1A4B33] hover:bg-white/5 transition-colors"
      >
        <BrandLogo compact darkSurface />
        <div>
          <div className="text-[11px] text-emerald-300/80 font-medium">
            {currentRole === 'farmer'
              ? (language === 'bn' ? 'কৃষক পোর্টাল' : language === 'hi' ? 'किसान पोर्टल' : 'Farmer Portal')
              : currentRole === 'buyer'
              ? (language === 'bn' ? 'ক্রেতা ড্যাশবোর্ড' : language === 'hi' ? 'खरीदार डैशबोर्ड' : 'Buyer Portal')
              : currentRole === 'fleet'
              ? 'Fleet Operations'
              : (language === 'bn' ? 'প্রশাসন কেন্দ্র' : language === 'hi' ? 'प्रशासन केंद्र' : 'Agri Intelligence')}
          </div>
        </div>
      </div>

      {/* User Mini Profile Card */}
      {currentUser && (
        <div className="p-4 mx-3 my-3 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-200 flex items-center justify-center font-bold text-lg shrink-0">
            {currentUser.avatar || (currentRole === 'farmer' ? '👨🌾' : currentRole === 'buyer' ? '🛒' : '🏛️')}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-white truncate">
              {currentUser.name}
            </h4>
            <p className="text-[11px] text-emerald-200/80 truncate">
              {currentRole === 'farmer'
                ? ((currentUser as any).district || 'South 24 Parganas')
                : currentRole === 'buyer'
                ? ((currentUser as any).businessName || 'Kolkata Fresh Mart')
                : currentRole === 'fleet'
                ? 'Demo Fleet Driver'
                : (language === 'bn' ? 'সিস্টেম অ্যাডমিন' : language === 'hi' ? 'सिस्टम एडमिन' : 'System Admin')}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        {currentRole === 'farmer' && (
          <>
            <button
              onClick={() => onNavigate('farmer-dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left cursor-pointer ${
                currentRoute === 'farmer-dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'হোম' : language === 'hi' ? 'होम' : 'Home'}</span>
            </button>

            <button
              onClick={() => onNavigate('farmer-sell')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left cursor-pointer ${
                currentRoute === 'farmer-sell'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'ফসল বিক্রি' : language === 'hi' ? 'फसल बेचें' : 'Sell Produce'}</span>
            </button>

            <button
              onClick={() => {
                onNavigate('farmer-dashboard');
                onActionClick?.('market-price');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'আজকের বাজার দর' : language === 'hi' ? 'आज का बाजार भाव' : "Today's Market Price"}</span>
            </button>

            <button
              onClick={() => {
                onNavigate('farmer-dashboard');
                onActionClick?.('my-orders');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'আমার অর্ডার' : language === 'hi' ? 'मेरे ऑर्डर' : 'My Orders'}</span>
            </button>

            <button
              onClick={() => onNavigate('farmer-ai-assistant')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left cursor-pointer ${
                currentRoute === 'farmer-ai-assistant'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4 shrink-0 text-amber-300" />
              <span>{language === 'bn' ? 'FarmE AI (ভয়েস)' : language === 'hi' ? 'FarmE AI (वॉयস)' : 'Ask FarmE AI'}</span>
            </button>

            <button
              onClick={() => onNavigate('farmer-ai-advisor')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left cursor-pointer ${
                currentRoute === 'farmer-ai-advisor'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
              <span>{language === 'bn' ? 'AI পরামর্শ' : language === 'hi' ? 'AI सलाह' : 'AI Advice'}</span>
            </button>

            <button
              onClick={() => onNavigate('farmer-crop-recommendation')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left cursor-pointer ${
                currentRoute === 'farmer-crop-recommendation'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
              <span>{language === 'bn' ? 'ফসল-থেকে-বাজার' : 'Crop-to-Market'}</span>
            </button>

            <button
              onClick={() => onNavigate('farmer-matched-buyers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left cursor-pointer ${
                currentRoute === 'farmer-matched-buyers'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'মিলেছে এমন ক্রেতা' : 'Matched Buyers'}</span>
            </button>

            <button
              onClick={() => {
                onNavigate('farmer-dashboard');
                onActionClick?.('delivery');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'ডেলিভারি' : 'Delivery'}</span>
            </button>

            <button
              onClick={() => onNavigate('farmer-logistics')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'স্মার্ট ডেলিভারি' : 'Smart Delivery'}</span>
            </button>
            <button
              onClick={() => onNavigate('farmer-emergency')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'জরুরি বাজার' : 'Emergency Market'}</span>
            </button>

            <button
              onClick={() => {
                onNavigate('farmer-dashboard');
                onActionClick?.('help');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'সাহায্য' : 'Help & Support'}</span>
            </button>
          </>
        )}

        {currentRole === 'buyer' && (
          <>
            <button
              onClick={() => onNavigate('buyer-dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left cursor-pointer ${
                currentRoute === 'buyer-dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'ওভারভিউ' : 'Overview'}</span>
            </button>

            <button
              onClick={() => onNavigate('buyer-find-produce')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'ফসল খুঁজুন' : 'Find Produce'}</span>
            </button>

            <button
              onClick={() => onNavigate('buyer-demand')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'চাহিদা' : 'Market Demand'}</span>
            </button>

            <button
              onClick={() => onNavigate('buyer-orders')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'অর্ডারসমূহ' : 'Orders'}</span>
            </button>

            <button
              onClick={() => onNavigate('buyer-produce')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'সরবরাহকারী' : 'Suppliers'}</span>
            </button>

            <button
              onClick={() => onNavigate('buyer-shipments')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'লজিস্টিক্স' : 'Logistics'}</span>
            </button>
            <button
              onClick={() => onNavigate('buyer-shipments')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'আসন্ন চালান' : 'Incoming Shipments'}</span>
            </button>
          </>
        )}

        {currentRole === 'admin' && adminNav.length === 0 && (
          <>
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left cursor-pointer ${
                currentRoute === 'admin-dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'ওভারভিউ' : 'Overview'}</span>
            </button>

            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'কৃষকবৃন্দ' : 'Farmers'}</span>
            </button>

            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'ক্রেতাবৃন্দ' : 'Buyers'}</span>
            </button>

            <button
              onClick={() => onNavigate('admin-supply-demand')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'চাহিদা ও সরবরাহ' : 'Supply & Demand'}</span>
            </button>

            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'সতর্কতা' : 'Market Alerts'}</span>
            </button>
            <button
              onClick={() => onNavigate('admin-logistics')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'লজিস্টিকস বুদ্ধিমত্তা' : 'Logistics Intelligence'}</span>
            </button>
            <button
              onClick={() => onNavigate('admin-emergency')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'জরুরি বুদ্ধিমত্তা' : 'Emergency Intelligence'}</span>
            </button>

            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left text-emerald-100/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'প্রতিবেদন' : 'Reports'}</span>
            </button>
          </>
        )}

        {currentRole === 'fleet' && fleetNav.map(([route, label]) => (
          <button key={route} onClick={() => onNavigate(route)} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left cursor-pointer ${currentRoute === route ? 'bg-amber-600 text-white' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'}`}>
            {route === 'fleet-emergency' ? <AlertTriangle className="w-4 h-4" /> : route === 'fleet-route' ? <MapPin className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
            <span>{label}</span>
          </button>
        ))}

        {currentRole === 'admin' && adminNav.length > 0 && adminNav.map(([route, label]) => (
          <button key={`managed-${route}`} onClick={() => onNavigate(route)} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left cursor-pointer ${currentRoute === route ? 'bg-emerald-600 text-white' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'}`}>
            {route.includes('emergency') ? <AlertTriangle className="w-4 h-4" /> : route.includes('logistics') || route.includes('shipments') ? <Truck className="w-4 h-4" /> : route.includes('users') ? <Users className="w-4 h-4" /> : route.includes('orders') ? <ClipboardList className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-[#1A4B33] space-y-1">
        <button
          onClick={() => onNavigate('profile')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
            currentRoute === 'profile' ? 'bg-white/15 text-white' : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span>{language === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
            currentRoute === 'settings' ? 'bg-white/15 text-white' : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>{language === 'bn' ? 'সেটিংস' : 'Settings'}</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-colors text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
};
