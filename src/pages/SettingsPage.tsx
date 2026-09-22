import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../context/LanguageContext';
import { Language } from '../types';
import { ArrowLeft, Globe, Info, Check } from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { language, setLanguage, availableLanguages, t } = useTranslation();

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5 pb-24 text-left">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('profile')}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {t("settings.pageTitle")}
        </h1>
      </div>

      {/* Language Selection */}
      <Card className="p-5 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Globe className="w-4 h-4 text-emerald-700" />
          <span>{t("settings.languageSectionTitle")}</span>
        </div>
        <p className="text-xs text-slate-500">
          {t("settings.languageSectionDesc")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {availableLanguages.map((l) => {
            const isSelected = language === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code as Language)}
                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">{l.nativeName}</div>
                  <div className="text-[11px] text-slate-500">{l.label}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* System Architecture Details */}
      <Card className="p-5 border border-slate-200 space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Info className="w-4 h-4 text-blue-700" />
          <span>{t("settings.systemInfoTitle")}</span>
        </div>
        <div>{t("settings.systemAppName")}</div>
        <div>{t("settings.systemVersion")}</div>
        <div>{t("settings.systemType")}</div>
        <div>{t("settings.systemStorage")}</div>
      </Card>

      <div className="pt-2">
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={() => onNavigate('profile')}
        >
          {t("settings.backToProfile")}
        </Button>
      </div>
    </div>
  );
};
