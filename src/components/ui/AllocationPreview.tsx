import React, { useMemo } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { AllocationLine } from '../../types';

interface AllocationPreviewProps {
  totalQuantityKg: number;
  lines: AllocationLine[];
  onChangeQuantity: (buyerId: string, quantityKg: number) => void;
  singleOfferPricePerKg?: number;
}

export const AllocationPreview: React.FC<AllocationPreviewProps> = ({
  totalQuantityKg,
  lines,
  onChangeQuantity,
  singleOfferPricePerKg = 29,
}) => {
  const { t } = useTranslation();

  const allocated = useMemo(
    () => lines.reduce((sum, l) => sum + (Number(l.quantityKg) || 0), 0),
    [lines]
  );
  const remaining = totalQuantityKg - allocated;
  const splitTotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantityKg * l.pricePerKg, 0),
    [lines]
  );
  const singleTotal = totalQuantityKg * singleOfferPricePerKg;
  const difference = splitTotal - singleTotal;
  const overAllocated = allocated > totalQuantityKg;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 text-left">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">
            {t('phase3.allocationTitle')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('phase3.allocationSubtitle')}
          </p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
          {t('phase3.prototypeLabel')}
        </span>
      </div>

      <div className="space-y-3">
        {lines.map((line) => (
          <div
            key={line.buyerId}
            className="p-3.5 rounded-xl border border-slate-200 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-bold text-sm text-slate-900">{line.buyerName}</div>
                <div className="text-[11px] text-slate-500">
                  ₹{line.pricePerKg}/{t('common.kg')}
                </div>
              </div>
              <div className="text-right font-extrabold text-emerald-800 text-sm">
                ₹{(line.quantityKg * line.pricePerKg).toLocaleString('en-IN')}
              </div>
            </div>
            <label className="block text-xs font-semibold text-slate-600">
              {t('phase3.allocateQty')}
              <input
                type="number"
                min={0}
                max={totalQuantityKg}
                value={line.quantityKg}
                onChange={(e) => {
                  const next = Math.max(0, parseInt(e.target.value, 10) || 0);
                  onChangeQuantity(line.buyerId, next);
                }}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                aria-label={`${t('phase3.allocateQty')} ${line.buyerName}`}
              />
            </label>
          </div>
        ))}
      </div>

      <div
        className={`p-3 rounded-xl text-xs font-semibold border ${
          overAllocated
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : remaining === 0
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
        role="status"
      >
        <div className="flex justify-between gap-2">
          <span>
            {t('phase3.allocated')}: {allocated} / {totalQuantityKg} {t('common.kg')}
          </span>
          <span>
            {t('phase3.remaining')}: {Math.max(0, remaining)} {t('common.kg')}
          </span>
        </div>
        {overAllocated && (
          <p className="mt-1">{t('phase3.allocationOverError')}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-slate-500 font-semibold">{t('phase3.splitTotal')}</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">
            ₹{splitTotal.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-slate-500 font-semibold">
            {t('phase3.singleOfferTotal', { price: singleOfferPricePerKg })}
          </div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">
            ₹{singleTotal.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="text-emerald-800 font-semibold">{t('phase3.potentialDifference')}</div>
          <div className="text-lg font-extrabold text-emerald-900 mt-0.5">
            ₹{difference.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        {t('phase3.allocationDisclaimer')}
      </p>
    </div>
  );
};
