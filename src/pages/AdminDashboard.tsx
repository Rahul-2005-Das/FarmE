import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/ui/Sidebar';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { MarketNetworkMap } from '../components/MarketNetworkMap';
import { generateLogisticsPlan } from '../services/logisticsEngine';
import { loadCurrentLogisticsPlan } from '../services/storage';
import {
  Users,
  ShoppingBag,
  Package,
  ClipboardCheck,
  AlertTriangle,
  MapPin,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  Layers
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (route: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { t, language } = useTranslation();
  const { switchRole } = useAuth();
  const [selectedAlert, setSelectedAlert] = useState(false);
  const logisticsPlan = loadCurrentLogisticsPlan() ?? generateLogisticsPlan();
  const adminNav = [['admin-dashboard', 'Overview'], ['admin-users', 'Users'], ['admin-orders', 'Orders'], ['admin-supply-demand', 'Supply & Demand'], ['admin-logistics', 'Logistics'], ['admin-shipments', 'Shipments'], ['admin-emergency', 'Emergency'], ['admin-analytics', 'Analytics'], ['admin-settings', 'Settings']];

  const supplyDemandData = [
    { crop: 'Tomato', supply: '1,700 kg', demand: '2,400 kg', status: 'Shortage', color: 'bg-rose-100 text-rose-800 border-rose-300' },
    { crop: 'Potato', supply: '6,100 kg', demand: '4,800 kg', status: 'Surplus', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { crop: 'Onion', supply: '3,200 kg', demand: '3,100 kg', status: 'Balanced', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { crop: 'Cabbage', supply: '2,100 kg', demand: '2,600 kg', status: 'Slight Shortage', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#F8FAF8] text-slate-800">
      {/* 1. DESKTOP DEEP-GREEN SIDEBAR */}
      <Sidebar
        currentRoute="admin-dashboard"
        onNavigate={onNavigate}
        adminNav={adminNav}
      />

      {/* 2. MAIN ADMIN CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 max-w-6xl mx-auto space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏛️</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'bn' ? 'প্রশাসন ও নিয়ন্ত্রণ কক্ষ' : 'Agricultural Control Center'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {language === 'bn' ? 'কৃষি গোয়েন্দা ও বাজার ড্যাশবোর্ড' : 'Agricultural Intelligence Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'bn' ? 'রাজ্যব্যাপী চাহিদা, সরবরাহ ও সরবরাহ শৃঙ্খল মনিটরিং' : 'State-wide crop supply, demand matching, and logistics analytics'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full border border-slate-300">
              Demo Data
            </span>
            <LanguageSelector variant="compact" />
          </div>
        </div>

        {/* 4 Core Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'bn' ? 'সক্রিয় কৃষক' : 'Active Farmers'}
              </span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              1,248
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">
              {language === 'bn' ? '২৩টি মহকুমা' : '23 Sub-districts'}
            </p>
          </Card>

          <Card className="p-5 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'bn' ? 'সক্রিয় ক্রেতা' : 'Active Buyers'}
              </span>
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              186
            </div>
            <p className="text-[11px] text-blue-700 font-semibold">
              {language === 'bn' ? 'খুচরা ও পাইকারি' : 'Wholesale & Retail'}
            </p>
          </Card>

          <Card className="p-5 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'bn' ? 'তালিকাভুক্ত ফসল' : 'Produce Listed'}
              </span>
              <Package className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              3,840 <span className="text-sm font-semibold text-slate-500">{language === 'bn' ? 'টন' : 'tons'}</span>
            </div>
            <p className="text-[11px] text-amber-700 font-semibold">
              {language === 'bn' ? 'চলতি মরশুম' : 'Current harvest season'}
            </p>
          </Card>

          <Card className="p-5 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'bn' ? 'সম্পন্ন অর্ডার' : 'Matched Orders'}
              </span>
              <ClipboardCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              672
            </div>
            <p className="text-[11px] text-purple-700 font-semibold">
              {language === 'bn' ? '৯৮.৪% সফল ডেলিভারি' : '98.4% Fulfillment'}
            </p>
          </Card>
        </div>

        <Card className="p-5 border border-blue-200 bg-blue-50/50 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-extrabold text-slate-900">{t('adminAi.title')}</h2><p className="text-xs text-slate-500 mt-1">{t('adminAi.subtitle')}</p></div>
            <span className="text-[11px] font-bold rounded-full border border-blue-200 bg-white px-2.5 py-1 text-blue-800">{t('adminAi.prototype')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div className="rounded-xl border border-rose-200 bg-white p-3"><div className="font-bold text-rose-800">{t('adminAi.demand')}</div><div className="mt-1 text-slate-700">Tomato · 2,400 kg demand</div></div>
            <div className="rounded-xl border border-amber-200 bg-white p-3"><div className="font-bold text-amber-800">{t('adminAi.supply')}</div><div className="mt-1 text-slate-700">Potato · surplus risk</div></div>
            <div className="rounded-xl border border-blue-200 bg-white p-3"><div className="font-bold text-blue-800">{t('adminAi.price')}</div><div className="mt-1 text-slate-700">Tomato offers below ₹35 expectation</div></div>
            <div className="rounded-xl border border-emerald-200 bg-white p-3"><div className="font-bold text-emerald-800">{t('adminAi.logistics')}</div><div className="mt-1 text-slate-700">{logisticsPlan.vehicle.utilizationPercent}% vehicle utilization</div></div>
            <div className="rounded-xl border border-violet-200 bg-white p-3"><div className="font-bold text-violet-800">{t('adminAi.recovery')}</div><div className="mt-1 text-slate-700">{t('adminAi.recoveryDetail')}</div></div>
          </div>
        </Card>

        {/* ======================================================== */}
        {/* MAIN VISUALIZATION: SUPPLY vs DEMAND */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Supply vs Demand Table */}
          <div className="lg:col-span-8">
            <Card className="p-5 sm:p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-800" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    {language === 'bn' ? 'চাহিদা বনাম সরবরাহ বিশ্লেষণ' : 'Supply vs Demand Analysis'}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {language === 'bn' ? 'দৈনিক আপডেট' : 'Daily Live Match'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-3 font-bold">{language === 'bn' ? 'ফসল' : 'Crop'}</th>
                      <th className="py-3 px-3 font-bold">{language === 'bn' ? 'সরবরাহ' : 'Supply'}</th>
                      <th className="py-3 px-3 font-bold">{language === 'bn' ? 'চাহিদা' : 'Demand'}</th>
                      <th className="py-3 px-3 font-bold">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {supplyDemandData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-3 font-bold flex items-center gap-2">
                          <span>{row.crop === 'Tomato' ? '🍅' : row.crop === 'Potato' ? '🥔' : row.crop === 'Onion' ? '🧅' : '🥬'}</span>
                          <span>{row.crop}</span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">{row.supply}</td>
                        <td className="py-3.5 px-3 text-slate-600">{row.demand}</td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${row.color}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Regional Alert & Map Card */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 border-2 border-amber-300 bg-amber-50/60 space-y-3">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{language === 'bn' ? 'জরুরী বাজার সতর্কতা' : 'Key Market Alert'}</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {language === 'bn'
                  ? 'বারুইপুর ও সোনারপুর ব্লকে আগামী ৪ দিনে টমেটোর সরবরাহ ২০% বৃদ্ধির সম্ভাবনা।'
                  : 'Tomato surplus expected in Baruipur cluster in 4 days. Re-routing buyers.'}
              </p>
              <button
                onClick={() => setSelectedAlert(!selectedAlert)}
                className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{selectedAlert ? (language === 'bn' ? 'সংক্ষিপ্ত করুন' : 'Hide details') : (language === 'bn' ? 'বিস্তারিত দেখুন →' : 'View Details →')}</span>
              </button>

              {selectedAlert && (
                <div className="pt-2 text-[11px] text-amber-900 space-y-1 border-t border-amber-200 animate-in fade-in">
                  <p>• প্রস্তাবিত পদক্ষেপ: নিকটবর্তী কোল্ড স্টোরেজ রিজার্ভেশন</p>
                  <p>• প্রস্তাবিত পদক্ষেপ: কলকাতা খুচরা বাজারে বিশেষ যৌথ লট অফার</p>
                </div>
              )}
            </Card>

            <Card className="p-5 border border-slate-200 bg-white space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>{language === 'bn' ? 'আঞ্চলিক ক্লাস্টার ট্র্যাকিং' : 'Regional Cluster Map'}</span>
              </div>
              <p className="text-slate-500">
                {language === 'bn'
                  ? 'দক্ষিণ ২৪ পরগনা, হুগলি ও নদিয়া জেলায় পরিবহন নেটওয়ার্ক স্বাভাবিক।'
                  : 'Active shared routes across South 24 Parganas, Hooghly and Nadia.'}
              </p>
              <MarketNetworkMap plan={logisticsPlan} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
