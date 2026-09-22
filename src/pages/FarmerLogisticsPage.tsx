import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { ShipmentTimeline } from '../components/ShipmentTimeline';
import { useTranslation } from '../context/LanguageContext';
import { LogisticsPlan } from '../types';
import { generateLogisticsPlan } from '../services/logisticsEngine';
import { createOrderLogisticsPlan, getLatestOrderForUser, loadOrderLogistics, saveLogisticsPlan } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { Truck, MapPin, Package, CalendarClock } from 'lucide-react';

interface Props { onNavigate: (route: string) => void; }

export const FarmerLogisticsPage: React.FC<Props> = ({ onNavigate }) => {
  const { t, language } = useTranslation();
  const { currentUser } = useAuth();
  const order = getLatestOrderForUser(currentUser?.id, 'farmer');
  const orderId = order?.id;
  const [plan] = useState<LogisticsPlan>(() => orderId
    ? loadOrderLogistics(orderId) ?? createOrderLogisticsPlan(order!)
    : generateLogisticsPlan());
    
  useEffect(() => { saveLogisticsPlan(plan); }, [plan]);

  // Find the farmer's specific contribution
  const myContribution = plan.farmers.find(f => f.name === currentUser?.name)?.quantityKg ?? Math.round(plan.totalQuantityKg / plan.farmers.length);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-5 text-left pb-24">
      <div className="flex justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('farmer-dashboard')}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer mb-2"
          >
            <span aria-hidden="true">←</span>
            <span>{language === 'bn' ? 'ফিরে যান' : language === 'hi' ? 'वापस जाएं' : 'Back'}</span>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900">{language === 'bn' ? 'কৃষক লজিস্টিকস' : language === 'hi' ? 'किसान लॉजिस्टिक्स' : 'Farmer Logistics'}</h1>
          <p className="text-xs text-slate-500 mt-1">{language === 'bn' ? 'আপনার স্থানীয় সমন্বিত পরিকল্পনা' : language === 'hi' ? 'आपकी स्थानीय एकत्रित योजना' : 'Your localized aggregation plan'}</p>
        </div>
        <LanguageSelector variant="compact" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* My Produce Info */}
        <Card className="p-5 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-700" />
            <h2 className="font-extrabold text-slate-900">{language === 'bn' ? 'আমার অবদান' : language === 'hi' ? 'मेरा योगदान' : 'My Contribution'}</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{language === 'bn' ? 'আমার ফসল' : language === 'hi' ? 'मेरी उपज' : 'My Produce'}</span>
              <span className="font-bold">{myContribution} kg {plan.crop}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{language === 'bn' ? 'সমষ্টিগত চালান' : language === 'hi' ? 'समूहित शिपमेंट' : 'Grouped Shipment'}</span>
              <span className="font-bold">{plan.totalQuantityKg} kg</span>
            </div>
          </div>
        </Card>

        {/* Collection & Vehicle */}
        <Card className="p-5 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h2 className="font-extrabold text-slate-900">{language === 'bn' ? 'পিকআপ বিবরণ' : language === 'hi' ? 'पिकअप विवरण' : 'Pickup Details'}</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{language === 'bn' ? 'সংগ্রহ স্থান' : language === 'hi' ? 'संग्रह बिंदु' : 'Collection Point'}</span>
              <span className="font-bold">{plan.collectionPoint.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{language === 'bn' ? 'বরাদ্দকৃত গাড়ি' : language === 'hi' ? 'आवंटित वाहन' : 'Vehicle Assigned'}</span>
              <span className="font-bold">{plan.vehicle.name}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Delivery Schedule */}
      <Card className="p-5 border border-slate-200 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-emerald-700" />
          <h2 className="font-extrabold text-slate-900">{language === 'bn' ? 'পিকআপ সময়সূচী' : language === 'hi' ? 'पिकअप समय-सारणी' : 'Pickup Schedule'}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">{language === 'bn' ? 'বরাদ্দকৃত পিকআপ সময়' : language === 'hi' ? 'आवंटित पिकअप स्लॉट' : 'Assigned Pickup Slot'}</p>
            <strong className="text-emerald-900">{plan.deliverySchedule?.pickupSlot ?? '08:00–09:00'}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">{language === 'bn' ? 'চালান অবস্থা' : language === 'hi' ? 'शिपमेंट स्थिति' : 'Shipment Status'}</p>
            <strong className="text-emerald-900">{plan.status}</strong>
          </div>
        </div>
      </Card>

      <Card className="p-5 border border-slate-200">
        <h2 className="font-extrabold text-slate-900 mb-5">{t('phase4.shipmentTimeline')}</h2>
        <ShipmentTimeline events={plan.timeline} />
      </Card>
    </div>
  );
};
