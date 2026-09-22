import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { WB_DISTRICTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { Phone, KeyRound, User, MapPin, Navigation, ArrowLeft, Sparkles } from 'lucide-react';

interface FarmerRegisterPageProps {
  onNavigate: (route: string) => void;
}

export const FarmerRegisterPage: React.FC<FarmerRegisterPageProps> = ({ onNavigate }) => {
  const { registerFarmer } = useAuth();
  const { t, language } = useTranslation();

  const [step, setStep] = useState<number>(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('South 24 Parganas');
  const [village, setVillage] = useState('');
  const [farmSize, setFarmSize] = useState('2.5');
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

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
      if (!name.trim()) {
        setError(t("register.fullNameLabel"));
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!village.trim()) {
        setError(t("register.villageLabel"));
        return;
      }
      setStep(5);
    } else if (step === 5) {
      registerFarmer({
        name,
        mobile,
        district,
        village,
        farmSizeAcres: parseFloat(farmSize) || 2.5,
        primaryCrops: ['Tomato', 'Potato'],
      });
      setIsCompleted(true);
    }
  };

  const handleUseGps = () => {
    setIsGpsLoading(true);
    setTimeout(() => {
      setDistrict('South 24 Parganas');
      setVillage('Champahati');
      setIsGpsLoading(false);
    }, 600);
  };

  if (isCompleted) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <Card className="p-8 border-2 border-emerald-400 bg-white shadow-lg text-center animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-4xl mx-auto mb-5 shadow-xs">
            🎉
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            {t("register.farmerSuccessTitle")}
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            {t("register.farmerSuccessDesc")}
          </p>

          <div className="mt-6 p-4 rounded-xl bg-emerald-50 text-left text-xs text-slate-700 space-y-1.5 border border-emerald-200/80">
            <div><span className="font-bold">{t("register.fullNameLabel")}:</span> {name || 'Ramesh Mondal'}</div>
            <div><span className="font-bold">{t("auth.mobileLabel")}:</span> +91 {mobile}</div>
            <div><span className="font-bold">{t("common.location")}:</span> {village}, {district}</div>
            <div><span className="font-bold">{t("profile.languageLabel")}:</span> {language === 'bn' ? 'বাংলা' : language === 'hi' ? 'हिंदी' : 'English'}</div>
          </div>

          <Button
            variant="farmer"
            size="xl"
            fullWidth
            onClick={() => onNavigate('farmer-dashboard')}
            className="mt-6 text-lg"
          >
            {t("register.goToFarmerDashboard")} →
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-10 text-left">
      {/* Header with Back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : onNavigate('register'))}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 min-h-[40px] px-2 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("common.back")}</span>
        </button>
        <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full">
          {t("register.step")} {step} {t("register.of")} 5
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-6">
        <div
          className="bg-emerald-700 h-full transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <Card className="p-6 border border-slate-200 shadow-sm">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👨🌾</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t("register.farmerStepTitle")}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("register.farmerStepSubtitle")}
          </p>
        </div>

        {/* STEP 1: MOBILE NUMBER */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
              🌱 {t("register.enterMobileStep")}
            </div>
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMobile('9830123456')}
                className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                {t("auth.useDemoMobile")} (9830123456)
              </button>
            </div>
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
              className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              {t("auth.autoFillOtp")}
            </button>
          </div>
        )}

        {/* STEP 3: FULL NAME */}
        {step === 3 && (
          <div className="space-y-4">
            <Input
              label={t("register.fullNameLabel")}
              type="text"
              placeholder={t("register.fullNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-4 h-4" />}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setName('Ramesh Mondal')}
                className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                {t("register.fillDemoName")}
              </button>
            </div>
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
              label={t("register.villageLabel")}
              placeholder={t("register.villagePlaceholder")}
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />

            {/* GPS Button */}
            <button
              type="button"
              onClick={handleUseGps}
              disabled={isGpsLoading}
              className="w-full py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Navigation className={`w-4 h-4 text-emerald-700 ${isGpsLoading ? 'animate-spin' : ''}`} />
              <span>{isGpsLoading ? t("register.locatingGps") : t("register.useGpsButton")}</span>
            </button>
          </div>
        )}

        {/* STEP 5: CONFIRM DETAILS */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">
                {t("register.confirmFarmerDetails")}
              </div>
              <div><span className="font-semibold text-slate-600">{t("register.fullNameLabel")}:</span> {name}</div>
              <div><span className="font-semibold text-slate-600">{t("auth.mobileLabel")}:</span> +91 {mobile}</div>
              <div><span className="font-semibold text-slate-600">{t("register.districtLabel")}:</span> {district}</div>
              <div><span className="font-semibold text-slate-600">{t("register.villageLabel")}:</span> {village}</div>
            </div>

            <Input
              label={t("register.farmSizeLabel")}
              type="number"
              step="0.1"
              value={farmSize}
              onChange={(e) => setFarmSize(e.target.value)}
              placeholder="2.5"
            />
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
            variant="farmer"
            size="lg"
            fullWidth
            onClick={handleNext}
          >
            {step === 5 ? t("common.confirm") : t("common.next")} →
          </Button>
        </div>
      </Card>
    </div>
  );
};
