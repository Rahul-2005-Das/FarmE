import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { AllocationPreview } from '../components/ui/AllocationPreview';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { matchBuyersForListing } from '../services/matchingEngine';
import { getActiveFarmerListing } from '../services/storage';
import { AllocationLine, FarmerProduceListing, ProduceGrade } from '../types';
import { ArrowLeft, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

interface MatchedBuyersPageProps {
  onNavigate: (route: string) => void;
}

const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div
        className="h-full rounded-full bg-emerald-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
);

export const MatchedBuyersPage: React.FC<MatchedBuyersPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const listing = useMemo(
    () => getActiveFarmerListing(currentUser?.id) as Partial<FarmerProduceListing>,
    [currentUser?.id]
  );

  const crop = listing.crop || 'Tomato';
  const quantity = listing.quantity || 500;
  const grade = (listing.grade || 'Grade A') as ProduceGrade;
  const harvestDate = listing.harvestDate || 'Within 4 days';
  const expectedPrice = listing.expectedPrice || 35;
  const location = listing.location || {
    district: (currentUser as { district?: string })?.district || 'South 24 Parganas',
    village: (currentUser as { village?: string })?.village || 'Champahati',
  };

  const matches = useMemo(
    () =>
      matchBuyersForListing({
        crop,
        quantity,
        grade,
        expectedPrice,
        harvestDate,
        location,
      }),
    [crop, quantity, grade, expectedPrice, harvestDate, location]
  );

  const [allocLines, setAllocLines] = useState<AllocationLine[]>([]);

  useEffect(() => {
    if (matches.length >= 2) {
      const a = Math.round(quantity * 0.6);
      setAllocLines([
        {
          buyerId: matches[0].buyerId,
          buyerName: matches[0].buyerName,
          quantityKg: a,
          pricePerKg: matches[0].offeredPricePerKg,
        },
        {
          buyerId: matches[1].buyerId,
          buyerName: matches[1].buyerName,
          quantityKg: quantity - a,
          pricePerKg: matches[1].offeredPricePerKg,
        },
      ]);
    }
  }, [matches, quantity]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 text-left space-y-5 pb-24">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate('farmer-ai-advisor')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
        <LanguageSelector variant="compact" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('phase3.matchedBuyersTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">{t('phase3.matchedBuyersSubtitle')}</p>
        <p className="text-[11px] text-slate-400 mt-1">{t('phase3.prototypeLabel')}</p>
      </div>

      {matches.length === 0 ? (
        <Card className="p-6 border border-slate-200 text-center text-sm text-slate-500">
          {t('phase3.noBuyersFound')}
        </Card>
      ) : (
        <div className="space-y-3">
          {matches.map((m, idx) => {
            const open = expandedId === m.buyerId + idx;
            return (
              <Card key={`${m.buyerId}-${idx}`} className="p-5 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      #{idx + 1} · {m.buyerType}
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 mt-0.5">{m.buyerName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      {m.district} · {t('phase3.deadlineInDays', { days: m.deliveryDeadlineDays })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-extrabold text-emerald-800">{m.score}%</div>
                    <div className="text-[11px] font-bold text-slate-500">
                      {t('phase3.match')} · {m.matchLevel}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-400 block">{t('phase3.requiredQty')}</span>
                    <strong className="text-slate-900">
                      {m.requiredQuantityKg} {t('common.kg')}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">{t('phase3.offeredPrice')}</span>
                    <strong className="text-emerald-800">
                      ₹{m.offeredPricePerKg}/{t('common.kg')}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedId(open ? null : m.buyerId + idx)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                  aria-expanded={open}
                >
                  {t('phase3.viewMatchDetails')}
                  {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {open && (
                  <div className="space-y-2.5 pt-1 border-t border-slate-100">
                    <ScoreBar label={t('phase3.compatCrop')} value={m.breakdown.crop} />
                    <ScoreBar label={t('phase3.compatQuantity')} value={m.breakdown.quantity} />
                    <ScoreBar label={t('phase3.compatQuality')} value={m.breakdown.quality} />
                    <ScoreBar label={t('phase3.compatPrice')} value={m.breakdown.price} />
                    <ScoreBar label={t('phase3.compatDistance')} value={m.breakdown.distance} />
                    <ScoreBar label={t('phase3.compatTiming')} value={m.breakdown.timing} />
                    <p className="text-[11px] text-slate-500 pt-1">{m.explanation}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {allocLines.length >= 2 && (
        <AllocationPreview
          totalQuantityKg={quantity}
          lines={allocLines}
          singleOfferPricePerKg={Math.min(...matches.map((m) => m.offeredPricePerKg))}
          onChangeQuantity={(buyerId, quantityKg) => {
            setAllocLines((prev) =>
              prev.map((l) => (l.buyerId === buyerId ? { ...l, quantityKg } : l))
            );
          }}
        />
      )}
    </div>
  );
};
