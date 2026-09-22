import React, { useMemo, useState } from 'react';
import { MapPin, Route, Truck } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { LogisticsPlan } from '../types';

interface MarketNetworkMapProps {
  plan: LogisticsPlan;
}

type MarkerType = 'farmer' | 'collection' | 'buyer' | 'route';

export const MarketNetworkMap: React.FC<MarketNetworkMapProps> = ({ plan }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<{ type: MarkerType; index?: number } | null>(null);
  const routeStops = plan.route.stops;
  const points = useMemo(() => routeStops.map((stop, index) => ({
    ...stop,
    x: 10 + (index / Math.max(routeStops.length - 1, 1)) * 80,
    y: index % 2 === 0 ? 56 : 38,
  })), [routeStops]);
  const selectedStop = selected?.type === 'route' && selected.index !== undefined ? points[selected.index] : null;
  const farmer = plan.farmers[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            {t('marketMap.title')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{t('marketMap.subtitle')}</p>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-900">
          {t('marketMap.prototypeLabel')}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-[#eef5ef] p-2 sm:p-4 overflow-hidden">
        <svg viewBox="0 0 100 78" className="w-full h-auto min-h-[220px]" role="img" aria-label={t('marketMap.ariaLabel')}>
          <path d="M3 18 C18 8, 28 20, 42 12 S65 8, 78 17 S92 12, 98 22 L98 70 C78 64, 64 74, 45 66 S20 74, 3 62 Z" fill="#dbeadf" stroke="#b5cfbc" strokeWidth="0.6" />
          <path d="M8 35 C25 26, 35 48, 50 35 S75 28, 94 42" fill="none" stroke="#c3d8c9" strokeWidth="0.7" strokeDasharray="2 2" />
          {points.slice(0, -1).map((point, index) => {
            const next = points[index + 1];
            return <line key={`line-${point.name}-${index}`} x1={point.x} y1={point.y} x2={next.x} y2={next.y} stroke="#0f766e" strokeWidth="1.2" strokeDasharray="2 1" onClick={() => setSelected({ type: 'route', index })} className="cursor-pointer" />;
          })}
          {points.map((point, index) => {
            const isFarmer = point.type === 'farmer';
            const isBuyer = point.type === 'buyer';
            const color = isBuyer ? '#1d4ed8' : point.type === 'collection' ? '#d97706' : '#15803d';
            return (
              <g key={`${point.name}-${index}`} onClick={() => setSelected({ type: point.type, index })} className="cursor-pointer">
                <circle cx={point.x} cy={point.y} r="3.4" fill="white" stroke={color} strokeWidth="1.1" />
                <circle cx={point.x} cy={point.y} r="1.8" fill={color} />
                <text x={point.x} y={point.y + 8} textAnchor="middle" fontSize="3.1" fontWeight="700" fill="#334155">{point.name.length > 19 ? `${point.name.slice(0, 18)}...` : point.name}</text>
                {(isFarmer || isBuyer) && <text x={point.x} y={point.y - 5.5} textAnchor="middle" fontSize="2.8" fill={color}>{isFarmer ? t('marketMap.farmer') : t('marketMap.buyer')}</text>}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="rounded-xl border border-slate-200 bg-white p-3"><div className="font-bold text-emerald-800">{t('marketMap.farmer')}</div><div className="mt-1 text-slate-600">{farmer?.location || t('marketMap.supplyLocation')}</div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-3"><div className="font-bold text-amber-800">{t('marketMap.collection')}</div><div className="mt-1 text-slate-600">{plan.collectionPoint.location}</div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-3"><div className="font-bold text-blue-800">{t('marketMap.buyer')}</div><div className="mt-1 text-slate-600">{plan.buyerName}</div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-3"><div className="font-bold text-teal-800">{t('marketMap.route')}</div><div className="mt-1 text-slate-600">{plan.route.totalDistanceKm} km</div></div>
      </div>

      <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-700" />{t('marketMap.supplyAvailable')}</span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-600" />{t('marketMap.collection')}</span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-700" />{t('marketMap.buyer')}</span>
        <span className="inline-flex items-center gap-1"><Route className="w-3 h-3 text-teal-700" />{t('marketMap.clickRoute')}</span>
      </div>

      {selected && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700">
          {selected?.type === 'route' && selectedStop ? (
            <>
              <div className="font-extrabold text-slate-900">{t('marketMap.routeDetails')}</div>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs"><span>{t('marketMap.distance')}: {selectedStop.distanceFromPreviousKm} km</span><span>{t('marketMap.vehicle')}: {plan.vehicle.name}</span><span>{t('marketMap.utilization')}: {plan.vehicle.utilizationPercent}%</span><span>{t('marketMap.optimization')}: {plan.route.routeScore}%</span></div>
            </>
          ) : selected?.type === 'farmer' ? (
            <div><div className="font-extrabold text-slate-900">{t('marketMap.farmer')}</div><div className="mt-2 text-xs">{t('marketMap.crop')}: {farmer?.crop} · {t('marketMap.quantity')}: {farmer?.quantityKg} kg · {t('marketMap.quality')}: {farmer?.grade} · {t('marketMap.location')}: {farmer?.location}</div></div>
          ) : selected?.type === 'collection' ? (
            <div><div className="font-extrabold text-slate-900">{t('marketMap.collection')}</div><div className="mt-2 text-xs">{t('marketMap.capacity')}: {plan.collectionPoint.capacityKg} kg · {t('marketMap.assigned')}: {plan.totalQuantityKg} kg · {t('marketMap.vehicle')}: {plan.vehicle.name}</div></div>
          ) : selected?.type === 'buyer' ? (
            <div><div className="font-extrabold text-slate-900">{t('marketMap.buyer')}</div><div className="mt-2 text-xs">{t('marketMap.crop')}: {plan.crop} · {t('marketMap.quantity')}: {plan.totalQuantityKg} kg · {t('marketMap.price')}: {t('marketMap.prototypeOffer')}</div></div>
          ) : (
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-emerald-700" />{t('marketMap.routeDetails')}: {plan.route.totalDistanceKm} km, {plan.vehicle.usedKg}/{plan.vehicle.capacityKg} kg.</div>
          )}
        </div>
      )}
    </div>
  );
};
