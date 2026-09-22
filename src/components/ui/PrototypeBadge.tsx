import React from 'react';
import { Info, Sparkles } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export const PrototypeBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useTranslation();

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
        <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
        <span>{t("common.prototypeBadge")}</span>
      </span>
    );
  }

  return (
    <div className="bg-emerald-950 text-emerald-100 text-xs px-3 py-1.5 flex items-center justify-between border-b border-emerald-900/50">
      <div className="flex items-center gap-2 max-w-6xl mx-auto w-full justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{t("landing.evalNoticeTitle")} • {t("common.prototypeBadge")}</span>
        </span>
        <span className="hidden sm:inline-block text-emerald-300 text-[11px]">
          {t("common.tagline")}
        </span>
      </div>
    </div>
  );
};
