import React from 'react';
import { Card } from '../components/ui/Card';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface RoleSelectPageProps {
  onNavigate: (route: string) => void;
}

export const RoleSelectPage: React.FC<RoleSelectPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  const handleSelect = (role: 'farmer' | 'buyer' | 'fleet' | 'admin') => {
    localStorage.setItem('krishok_bandhu_login_role', role);
    onNavigate('login');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 text-center">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
          {t("roles.rolePrompt")}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4">
          {t("roles.roleSelectTitle")}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          {t("roles.roleSelectSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        {/* Farmer Card */}
        <Card
          variant="farmer"
          onClick={() => handleSelect('farmer')}
          className="group relative border-2 border-emerald-300/80 bg-emerald-50/30 hover:border-emerald-700 hover:shadow-md transition-all p-6"
        >
          <div className="flex items-start justify-between">
            <span className="text-5xl mb-3 block">👨🌾</span>
            <span className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {t("roles.farmerTitle")}
          </h2>
          <div className="text-sm font-semibold text-emerald-800">
            {t("roles.farmerSubtitle")}
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {t("roles.farmerDesc")}
          </p>
          <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs font-bold text-emerald-900">
            <span>{t("landing.farmerSubtext")}</span>
            <span>{t("roles.farmerAction")}</span>
          </div>
        </Card>

        {/* Buyer Card */}
        <Card
          variant="interactive"
          onClick={() => handleSelect('buyer')}
          className="group relative border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 hover:shadow-md transition-all p-6"
        >
          <div className="flex items-start justify-between">
            <span className="text-5xl mb-3 block">🛒</span>
            <span className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {t("roles.buyerTitle")}
          </h2>
          <div className="text-sm font-semibold text-blue-700">
            {t("roles.buyerSubtitle")}
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {t("roles.buyerDesc")}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-blue-800">
            <span>{t("landing.buyerSubtext")}</span>
            <span>{t("roles.buyerAction")}</span>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card
          variant="interactive"
          onClick={() => handleSelect('fleet')}
          className="group relative border-2 border-amber-200 bg-amber-50/40 hover:border-amber-600 hover:shadow-md transition-all p-5"
        >
          <div className="flex items-start justify-between">
            <div><span className="text-4xl mb-2 block">🚚</span><h2 className="text-xl font-extrabold text-slate-900">{t("roles.fleetTitle") || 'Fleet Driver'}</h2><p className="text-sm font-semibold text-amber-800">{t("roles.fleetSubtitle") || 'Assigned shipments and route execution'}</p></div>
            <span className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center"><ArrowRight className="w-4 h-4" /></span>
          </div>
          <p className="text-xs text-slate-600 mt-2">{t("roles.fleetDesc") || 'Pickup, transit, delivery and emergency recovery demo.'}</p>
        </Card>
      </div>

      {/* Admin Card */}
      <div className="mt-6">
        <Card
          variant="interactive"
          onClick={() => handleSelect('admin')}
          className="border border-slate-300 hover:border-slate-500 bg-slate-50/70 p-4 text-left flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="text-3xl">🏛️</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {t("roles.adminTitle")}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {t("roles.adminBadge")}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t("roles.adminDesc")}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
        </Card>
      </div>

      <div className="mt-8 text-xs text-slate-500">
        {t("auth.newHerePrompt")}{' '}
        <button
          onClick={() => onNavigate('register')}
          className="font-bold text-emerald-800 hover:underline cursor-pointer"
        >
          {t("auth.registerNow")}
        </button>
      </div>
    </div>
  );
};
