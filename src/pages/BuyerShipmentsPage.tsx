import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { ShipmentTimeline } from '../components/ShipmentTimeline';
import { useTranslation } from '../context/LanguageContext';
import { LogisticsPlan } from '../types';
import { generateLogisticsPlan } from '../services/logisticsEngine';
import { createOrderLogisticsPlan, getLatestOrderForUser, getOrdersForBuyer, loadOrderLogistics, saveLogisticsPlan } from '../services/storage';
import { useAuth } from '../context/AuthContext';

interface Props { onNavigate: (route: string) => void; }

export const BuyerShipmentsPage: React.FC<Props> = ({ onNavigate }) => {
  const { t, language } = useTranslation();
  const { currentUser } = useAuth();
  const order = getLatestOrderForUser(currentUser?.id, 'buyer');
  const orderId = order?.id;
  const buyerOrders = getOrdersForBuyer(currentUser?.id);
  const [plan] = useState<LogisticsPlan>(() => orderId
    ? loadOrderLogistics(orderId) ?? createOrderLogisticsPlan(order!)
    : generateLogisticsPlan());
  useEffect(() => { saveLogisticsPlan(plan); }, [plan]);
  return <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-5 text-left pb-24">
    <div className="flex justify-between gap-3"><div><button type="button" onClick={() => onNavigate('buyer-dashboard')} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer mb-2"><span aria-hidden="true">←</span><span>{language === 'bn' ? 'ফিরে যান' : language === 'hi' ? 'वापस जाएं' : 'Back'}</span></button><h1 className="text-2xl font-extrabold text-slate-900">{t('phase4.incomingShipments')}</h1><p className="text-xs text-slate-500 mt-1">{t('phase4.prototypeEstimate')}</p></div><LanguageSelector variant="compact" /></div>
    <Card className="p-5 border border-slate-200 space-y-4"><h2 className="font-extrabold text-slate-900">{language === 'bn' ? 'আমার অর্ডার' : language === 'hi' ? 'मेरे ऑर्डर' : 'My Orders'}</h2>{buyerOrders.length === 0 ? <p className="text-sm text-slate-500">{language === 'bn' ? 'এখনও কোনো ক্রেতা-নির্দিষ্ট অর্ডার নেই।' : language === 'hi' ? 'अभी तक कोई खरीदार-विशिष्ट ऑर्डर नहीं है।' : 'No buyer-specific orders yet.'}</p> : <div className="space-y-2">{buyerOrders.map((item) => <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm"><span><strong>{item.cropNameEn}</strong> · {item.quantityKg} kg</span><span>{item.farmerName} · <strong>{item.status}</strong></span></div>)}</div>}<div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4"><div><p className="text-xs text-slate-500">{t('phase4.buyer')}</p><strong>{plan.buyerName}</strong></div><div><p className="text-xs text-slate-500">{t('phase4.quantity')}</p><strong>{plan.totalQuantityKg} kg {plan.crop}</strong></div><div><p className="text-xs text-slate-500">{t('phase4.farmers')}</p><strong>{plan.farmers.length}</strong></div><div><p className="text-xs text-slate-500">{t('phase4.collectionPoint')}</p><strong>{plan.collectionPoint.location}</strong></div><div><p className="text-xs text-slate-500">{t('phase4.vehicle')}</p><strong>{plan.vehicle.name}</strong></div><div><p className="text-xs text-slate-500">{t('phase4.deliveryStatus')}</p><strong className="text-amber-800">{plan.status}</strong></div></div><div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold">{plan.route.stops.map((stop) => stop.name).join(' → ')}</div><p className="text-xs text-slate-500">{t('phase4.eta')}: {t('phase4.prototypeEstimate')}</p></Card>
    <Card className="p-5 border border-slate-200"><h2 className="font-extrabold text-slate-900 mb-5">{t('phase4.shipmentTimeline')}</h2><ShipmentTimeline events={plan.timeline} /></Card>
  </div>;
};
