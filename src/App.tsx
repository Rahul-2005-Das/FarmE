import React, { useState, useEffect } from 'react';
import { useTranslation } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { Header } from './components/ui/Header';
import { MobileBottomNav } from './components/ui/MobileBottomNav';
import { BrandLogo } from './components/ui/BrandLogo';

// Pages
import { LandingPage } from './pages/LandingPage';
import { RoleSelectPage } from './pages/RoleSelectPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterSelectPage } from './pages/RegisterSelectPage';
import { FarmerRegisterPage } from './pages/FarmerRegisterPage';
import { BuyerRegisterPage } from './pages/BuyerRegisterPage';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { FarmerCropRecommendationPage } from './pages/FarmerCropRecommendationPage';
import { FarmerAiCopilotPage } from './pages/FarmerAiCopilotPage';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { SmartListingPage } from './pages/SmartListingPage';
import { AiAdvisorPage } from './pages/AiAdvisorPage';
import { MatchedBuyersPage } from './pages/MatchedBuyersPage';
import { BuyerFindProducePage } from './pages/BuyerFindProducePage';
import { AdminSupplyDemandPage } from './pages/AdminSupplyDemandPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { FarmerLogisticsPage } from './pages/FarmerLogisticsPage';
import { BuyerShipmentsPage } from './pages/BuyerShipmentsPage';
import { AdminLogisticsPage } from './pages/AdminLogisticsPage';
import { EmergencyMarketPage } from './pages/EmergencyMarketPage';
import { FarmerEmergencyPage } from './pages/FarmerEmergencyPage';
import { AdminEmergencyPage } from './pages/AdminEmergencyPage';
import { FarmerVoiceAssistantPage } from './pages/FarmerVoiceAssistantPage';
import { FleetDashboard } from './pages/FleetDashboard';
import { AdminOperationsPage } from './pages/AdminOperationsPage';

export const App: React.FC = () => {
  const { t } = useTranslation();
  const { currentRole, isAuthenticated } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>('landing');

  const getHashRoute = () => window.location.hash.replace(/^#\/?/, '') || '';

  const farmerRoutes = ['farmer-dashboard', 'farmer-crops', 'farmer-orders', 'farmer-advice', 'farmer-sell', 'farmer-ai-advisor', 'farmer-ai-copilot', 'farmer-crop-recommendation', 'farmer-matched-buyers', 'farmer-logistics', 'farmer-emergency', 'farmer-ai-assistant'];
  const buyerRoutes = ['buyer-dashboard', 'buyer-produce', 'buyer-orders', 'buyer-demand', 'buyer-find-produce', 'buyer-shipments'];
  const fleetRoutes = ['fleet-dashboard', 'fleet-shipments', 'fleet-active-delivery', 'fleet-route', 'fleet-history', 'fleet-emergency', 'fleet-profile'];
  const adminRoutes = ['admin-dashboard', 'admin-users', 'admin-orders', 'admin-supply-demand', 'logistics', 'admin-logistics', 'admin-shipments', 'admin-emergency', 'admin-analytics', 'admin-settings', 'emergency-market'];
  const publicRoutes = ['landing', 'role-select', 'login', 'register', 'register-farmer', 'register-buyer'];
  const authenticatedRoutes = ['profile', 'settings'];

  const getRequiredRole = (route: string) => farmerRoutes.includes(route)
    ? 'farmer'
    : buyerRoutes.includes(route)
    ? 'buyer'
    : fleetRoutes.includes(route)
    ? 'fleet'
    : adminRoutes.includes(route)
    ? 'admin'
    : authenticatedRoutes.includes(route)
    ? 'authenticated'
    : null;

  // Resolve hash changes and browser Back/Forward events through one guarded path.
  useEffect(() => {
    const handleHashChange = () => {
      const hashRoute = getHashRoute();
      const route = hashRoute || 'landing';
      const requiredRole = getRequiredRole(route);

      if (!publicRoutes.includes(route) && !requiredRole) {
        window.history.replaceState(null, '', '#/landing');
        setCurrentRoute('landing');
        return;
      }

      if (requiredRole && (!isAuthenticated || (requiredRole !== 'authenticated' && currentRole !== requiredRole))) {
        window.history.replaceState(null, '', '#/login');
        setCurrentRoute('login');
        return;
      }

      setCurrentRoute(route);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    handleHashChange();
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [currentRole, isAuthenticated]);

  const navigate = (route: string, options?: { replace?: boolean }) => {
    if (getHashRoute() !== route) {
      if (options?.replace) {
        window.history.replaceState(null, '', `#/${route}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        window.location.hash = `#/${route}`;
      }
    } else {
      setCurrentRoute(route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderRoute = () => {
    const requiredRole = getRequiredRole(currentRoute);

    if (requiredRole && (!isAuthenticated || (requiredRole !== 'authenticated' && currentRole !== requiredRole))) {
      return <LoginPage onNavigate={navigate} />;
    }

    switch (currentRoute) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'role-select':
        return <RoleSelectPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'register':
        return <RegisterSelectPage onNavigate={navigate} />;
      case 'register-farmer':
        return <FarmerRegisterPage onNavigate={navigate} />;
      case 'register-buyer':
        return <BuyerRegisterPage onNavigate={navigate} />;

      // Farmer Views
      case 'farmer-dashboard':
        return <FarmerDashboard onNavigate={navigate} />;
      case 'farmer-crops':
        return <FarmerDashboard onNavigate={navigate} activeSubView="crops" />;
      case 'farmer-orders':
        return <FarmerDashboard onNavigate={navigate} activeSubView="orders" />;
      case 'farmer-advice':
        return <FarmerDashboard onNavigate={navigate} activeSubView="advice" />;
      case 'farmer-sell':
        return <SmartListingPage onNavigate={navigate} />;
      case 'farmer-ai-advisor':
        return <AiAdvisorPage onNavigate={navigate} />;
      case 'farmer-ai-copilot':
        return <FarmerAiCopilotPage onNavigate={navigate} />;
      case 'farmer-crop-recommendation':
        return <FarmerCropRecommendationPage onNavigate={navigate} />;
      case 'farmer-matched-buyers':
        return <MatchedBuyersPage onNavigate={navigate} />;
      case 'farmer-logistics':
        return <FarmerLogisticsPage onNavigate={navigate} />;
      case 'farmer-emergency':
        return <FarmerEmergencyPage onNavigate={navigate} />;
      case 'farmer-ai-assistant':
        return <FarmerVoiceAssistantPage onNavigate={navigate} />;

      // Buyer Views
      case 'buyer-dashboard':
        return <BuyerDashboard onNavigate={navigate} />;
      case 'buyer-produce':
        return <BuyerFindProducePage onNavigate={navigate} />;
      case 'buyer-orders':
        return <BuyerShipmentsPage onNavigate={navigate} />;
      case 'buyer-demand':
        return <BuyerFindProducePage onNavigate={navigate} initialShowDemand />;
      case 'buyer-find-produce':
        return <BuyerFindProducePage onNavigate={navigate} />;
      case 'buyer-shipments':
        return <BuyerShipmentsPage onNavigate={navigate} />;

      // Fleet Views
      case 'fleet-dashboard':
        return <FleetDashboard onNavigate={navigate} />;
      case 'fleet-shipments':
        return <FleetDashboard onNavigate={navigate} view="shipments" />;
      case 'fleet-active-delivery':
        return <FleetDashboard onNavigate={navigate} view="active" />;
      case 'fleet-route':
        return <FleetDashboard onNavigate={navigate} view="route" />;
      case 'fleet-history':
        return <FleetDashboard onNavigate={navigate} view="history" />;
      case 'fleet-emergency':
        return <FleetDashboard onNavigate={navigate} view="emergency" />;
      case 'fleet-profile':
        return <FleetDashboard onNavigate={navigate} view="profile" />;

      // Admin & Common Views
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={navigate} />;
      case 'admin-supply-demand':
        return <AdminSupplyDemandPage onNavigate={navigate} />;
      case 'admin-users':
        return <AdminOperationsPage onNavigate={navigate} view="users" />;
      case 'admin-orders':
        return <AdminOperationsPage onNavigate={navigate} view="orders" />;
      case 'admin-shipments':
        return <AdminOperationsPage onNavigate={navigate} view="shipments" />;
      case 'admin-analytics':
        return <AdminOperationsPage onNavigate={navigate} view="analytics" />;
      case 'admin-settings':
        return <AdminOperationsPage onNavigate={navigate} view="settings" />;
      case 'logistics':
        return <LogisticsPage onNavigate={navigate} />;
      case 'admin-logistics':
        return <AdminLogisticsPage onNavigate={navigate} />;
      case 'emergency-market':
        return <EmergencyMarketPage onNavigate={navigate} />;
      case 'admin-emergency':
        return <AdminEmergencyPage onNavigate={navigate} />;
      case 'profile':
        return <ProfilePage onNavigate={navigate} />;
      case 'settings':
        return <SettingsPage onNavigate={navigate} />;

      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-slate-800 antialiased font-sans">
      {/* Main Global Header with Role & Language Switcher */}
      <Header onNavigate={navigate} currentRoute={currentRoute} />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {renderRoute()}
      </main>

      {/* Mobile Sticky Bottom Navigation (Farmer / Buyer) */}
      <MobileBottomNav currentTab={currentRoute} onSelectTab={navigate} />

      {/* Desktop / Tablet Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500 hidden md:block">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo compact />
            <span>• {t("footer.copyright")}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('role-select')}
              className="hover:text-emerald-800 font-medium cursor-pointer"
            >
              {t("footer.roleGateway")}
            </button>
            <button
              onClick={() => navigate('admin-dashboard')}
              className="hover:text-emerald-800 font-medium cursor-pointer"
            >
              {t("footer.adminDemo")}
            </button>
            <span className="text-slate-400">{t("footer.clientMockNotice")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
