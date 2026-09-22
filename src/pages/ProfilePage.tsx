import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { Phone, LogOut, Settings as SettingsIcon } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (route: string, options?: { replace?: boolean }) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { currentUser, currentRole, logout } = useAuth();
  const { t, language } = useTranslation();

  const handleLogout = () => {
    logout();
    onNavigate('login', { replace: true });
  };

  const roleLabel =
    currentRole === 'farmer' ? t("roles.farmerTitle") : currentRole === 'buyer' ? t("roles.buyerTitle") : currentRole === 'admin' ? t("roles.adminTitle") : t("common.status");

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5 pb-24 text-left">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900">
          {t("profile.pageTitle")}
        </h1>
        <button
          onClick={() => onNavigate('settings')}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <SettingsIcon className="w-4 h-4" />
          <span>{t("profile.settingsButton")}</span>
        </button>
      </div>

      <Card className="p-6 border border-slate-200 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl font-bold shadow-xs">
            {currentRole === 'farmer' ? '👨🌾' : currentRole === 'buyer' ? '🛒' : '🏛️'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {currentUser?.name || (currentRole === 'buyer' ? 'Kolkata Fresh Mart' : 'Ramesh Mondal')}
            </h2>
            <div className="text-xs font-semibold text-emerald-800 capitalize mt-0.5">
              {t("common.role")}: {roleLabel}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>+91 {currentUser?.mobile || '9830123456'}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between py-1">
            <span className="text-slate-400">{t("profile.locationLabel")}:</span>
            <strong className="text-slate-800">
              {(currentUser as any)?.village ? `${(currentUser as any).village}, ${(currentUser as any).district}` : 'South 24 Parganas, West Bengal'}
            </strong>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">{t("profile.languageLabel")}:</span>
            <strong className="text-slate-800">
              {language === 'bn' ? 'বাংলা (Bengali)' : language === 'hi' ? 'हिंदी (Hindi)' : 'English'}
            </strong>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">{t("profile.verificationStatus")}:</span>
            <span className="text-emerald-700 font-bold">✓ {t("profile.verifiedBadge")}</span>
          </div>
        </div>
      </Card>

      <div className="pt-2">
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={handleLogout}
          className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 font-bold text-sm"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t("profile.logoutButton")}
        </Button>
      </div>
    </div>
  );
};
