import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { WB_DISTRICTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { BuyerType } from '../types';
import { Phone, KeyRound, Building2, MapPin, ArrowLeft, Sparkles } from 'lucide-react';

interface BuyerRegisterPageProps {
  onNavigate: (route: string) => void;
}

export const BuyerRegisterPage: React.FC<BuyerRegisterPageProps> = ({ onNavigate }) => {
  const { registerBuyer } = useAuth();
  const { t } = useTranslation();

  const [step, setStep] = useState<number>(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [district, setDistrict] = useState('Kolkata');
  const [address, setAddress] = useState('');
  const [buyerType, setBuyerType] = useState<BuyerType>('Wholesaler');
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const buyerTypeOptions = [
    'Wholesaler',
    'Retailer',
    'Restaurant',
    'Institutional Buyer'
  ];

  const handleNext = () => {
    setError(null);

    if (step === 1) {
      if (!mobile || mobile.length < 10) {
        setError(t("auth.invalidMobileError"));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (otp !== '123456') {
        setError(t("auth.invalidOtpError"));
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!businessName.trim()) {
        setError(t("register.businessNameLabel"));
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!address.trim()) {
        setError(t("register.addressLabel"));
        return;
      }
      setStep(5);
    } else if (step === 5) {
      setStep(6);
    } else if (step === 6) {
      registerBuyer({
        name: businessName,
        businessName,
        mobile,
        district,
        address,
        buyerType,
      });
      setIsCompleted(true);
    }
  };

  if (isCompleted) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <Card className="p-8 border-2 border-blue-400 bg-white shadow-lg text-center animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-4xl mx-auto mb-5 shadow-xs">
            🎉
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            {t("register.buyerSuccessTitle")}
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            {t("register.buyerSuccessDesc")}
          </p>

          <div className="mt-6 p-4 rounded-xl bg-blue-50 text-left text-xs text-slate-700 space-y-1.5 border border-blue-200">
            <div><span className="font-bold">{t("register.businessNameLabel")}:</span> {businessName}</div>
            <div><span className="font-bold">{t("register.buyerTypeLabel")}:</span> {buyerType}</div>
            <div><span className="font-bold">{t("auth.mobileLabel")}:</span> +91 {mobile}</div>
            <div><span className="font-bold">{t("common.location")}:</span> {address}, {district}</div>
          </div>

          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={() => onNavigate('buyer-dashboard')}
            className="mt-6 bg-blue-800 hover:bg-blue-900 border-blue-950 text-base"
          >
            {t("register.goToBuyerDashboard")} →
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-10 text-left">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : onNavigate('register'))}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 min-h-[40px] px-2 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("common.back")}</span>
        </button>
        <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-900 rounded-full">
          {t("register.step")} {step} {t("register.of")} 6
        </span>
      </div>

      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-6">
        <div
          className="bg-blue-700 h-full transition-all duration-300"
          style={{ width: `${(step / 6) * 100}%` }}
        />
      </div>

      <Card className="p-6 border border-slate-200 shadow-sm">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t("register.buyerStepTitle")}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("register.buyerStepSubtitle")}
          </p>
        </div>

        {/* STEP 1: MOBILE */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label={t("auth.mobileLabel")}
              type="tel"
              maxLength={10}
              placeholder={t("auth.mobilePlaceholder")}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              icon={<Phone className="w-4 h-4" />}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setMobile('9831987654')}
              className="text-xs text-blue-700 hover:underline font-semibold cursor-pointer"
            >
              {t("auth.useDemoMobile")}: 9831987654
            </button>
          </div>
        )}

        {/* STEP 2: DEMO OTP */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block">{t("auth.demoOtpNotice")}</span>
              </div>
            </div>

            <Input
              label={t("auth.otpLabel")}
              type="text"
              maxLength={6}
              placeholder={t("auth.otpPlaceholder")}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              icon={<KeyRound className="w-4 h-4" />}
              autoFocus
            />

            <button
              type="button"
              onClick={() => setOtp('123456')}
              className="text-xs text-blue-700 hover:underline font-semibold cursor-pointer"
            >
              {t("auth.autoFillOtp")}
            </button>
          </div>
        )}

        {/* STEP 3: BUSINESS NAME */}
        {step === 3 && (
          <div className="space-y-4">
            <Input
              label={t("register.businessNameLabel")}
              placeholder={t("register.businessNamePlaceholder")}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              icon={<Building2 className="w-4 h-4" />}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setBusinessName('Kolkata Fresh Mart')}
              className="text-xs text-blue-700 hover:underline font-semibold cursor-pointer"
            >
              {t("register.fillDemoBusiness")}
            </button>
          </div>
        )}

        {/* STEP 4: LOCATION */}
        {step === 4 && (
          <div className="space-y-4">
            <Select
              label={t("register.districtLabel")}
              options={WB_DISTRICTS}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />

            <Input
              label={t("register.addressLabel")}
              placeholder={t("register.addressPlaceholder")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>
        )}

        {/* STEP 5: BUYER TYPE */}
        {step === 5 && (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-800">
              {t("register.buyerTypeLabel")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {buyerTypeOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setBuyerType(opt as BuyerType)}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    buyerType === opt
                      ? 'border-blue-700 bg-blue-50 text-blue-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-sm font-semibold">{opt}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: CREATE PROFILE */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">
                {t("register.confirmBuyerDetails")}
              </div>
              <div><span className="font-semibold text-slate-600">{t("register.businessNameLabel")}:</span> {businessName}</div>
              <div><span className="font-semibold text-slate-600">{t("register.buyerTypeLabel")}:</span> {buyerType}</div>
              <div><span className="font-semibold text-slate-600">{t("auth.mobileLabel")}:</span> +91 {mobile}</div>
              <div><span className="font-semibold text-slate-600">{t("common.location")}:</span> {address}, {district}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(step - 1)}
            >
              {t("common.back")}
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleNext}
            className="bg-blue-800 hover:bg-blue-900 border-blue-950"
          >
            {step === 6 ? t("common.confirm") : t("common.next")} →
          </Button>
        </div>
      </Card>
    </div>
  );
};
