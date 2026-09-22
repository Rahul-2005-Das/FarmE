import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { DemandAnalysis } from '../../types';

interface MarketAlertProps {
  analysis: DemandAnalysis;
  upcomingSupplyKg?: number;
}

export const MarketAlert: React.FC<MarketAlertProps> = ({
  analysis,
  upcomingSupplyKg,
}) => {
  const { t } = useTranslation();
  const incoming = upcomingSupplyKg ?? Math.max(0, Math.round(analysis.supply * 0.5));

  const impactKey =
    analysis.status === 'SURPLUS' || incoming > analysis.demand * 0.3
      ? 'phase3.alertImpactSurplus'
      : analysis.status === 'HIGH_DEMAND'
      ? 'phase3.alertImpactShortage'
      : 'phase3.alertImpactBalanced';

  return (
    <div
      className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-5 space-y-3 text-left"
      role="status"
      aria-label={t('phase3.earlyAlertTitle')}
    >
      <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
        <span>{t('phase3.earlyAlertTitle')}</span>
      </div>

      <p className="text-xs text-amber-950 font-medium leading-relaxed">
        {t('phase3.earlyAlertBody', { crop: analysis.crop })}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200">
          <div className="text-amber-800/80 font-semibold">{t('phase3.expectedIncomingSupply')}</div>
          <div className="font-extrabold text-amber-950 mt-0.5">+{incoming} {t('common.kg')}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200">
          <div className="text-amber-800/80 font-semibold">{t('phase3.currentEstimatedDemand')}</div>
          <div className="font-extrabold text-amber-950 mt-0.5">
            {analysis.demand.toLocaleString('en-IN')} {t('common.kg')}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200">
          <div className="text-amber-800/80 font-semibold">{t('phase3.potentialImpact')}</div>
          <div className="font-bold text-amber-950 mt-0.5">{t(impactKey)}</div>
        </div>
      </div>

      <div className="pt-1 border-t border-amber-200">
        <p className="text-xs font-bold text-amber-950">
          {t('phase3.recommendedActionLabel')}: {t('phase3.alertRecommendedAction')}
        </p>
        <p className="text-[11px] text-amber-800/90 mt-1">{t('phase3.prototypeLabel')}</p>
      </div>
    </div>
  );
};
