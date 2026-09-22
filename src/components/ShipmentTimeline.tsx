import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { ShipmentTimelineEvent } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface ShipmentTimelineProps {
  events: ShipmentTimelineEvent[];
}

export const ShipmentTimeline: React.FC<ShipmentTimelineProps> = ({ events }) => {
  const { t } = useTranslation();
    const labels: Record<string, string> = {
      'Order Confirmed': t('phase4.orderConfirmed'),
      'Farmers Grouped': t('phase4.farmersGroupedStatus'),
      'Collection Planned': t('phase4.collectionPlanned'),
      'Vehicle Assigned': t('phase4.vehicleAssigned'),
      'Pickup Started': 'Pickup Started',
      'Pickup Completed': 'Pickup Completed',
      'In Transit': t('phase4.inTransit'),
      'Near Buyer': 'Near Buyer',
      'Delivered': t('phase4.delivered'),
    };

  return (
    <ol className="grid grid-cols-1 md:grid-cols-9 gap-3" aria-label={t('phase4.shipmentTimeline')}>
      {events.map((event, index) => (
        <li key={event.status} className="relative flex md:flex-col items-center md:items-center gap-3 text-left md:text-center">
          {index < events.length - 1 && <span className="hidden md:block absolute top-4 left-1/2 w-full border-t border-slate-200" aria-hidden="true" />}
          {index > 0 && <span className="md:hidden absolute left-4 -top-3 h-3 border-l border-slate-200" aria-hidden="true" />}
          <span className="relative z-10 bg-white">
            {event.completed ? <CheckCircle2 className={`w-8 h-8 ${event.current ? 'text-amber-600' : 'text-emerald-700'}`} aria-hidden="true" /> : <Circle className="w-8 h-8 text-slate-300" aria-hidden="true" />}
          </span>
          <span className={`text-xs font-bold ${event.current ? 'text-amber-800' : event.completed ? 'text-slate-800' : 'text-slate-400'}`}>
            {labels[event.status] ?? event.status}
          </span>
        </li>
      ))}
    </ol>
  );
};
