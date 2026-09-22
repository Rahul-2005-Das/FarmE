import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { FarmerProduceListing, ProduceGrade, AIRecommendation } from '../types';
import {
  Mic,
  MicOff,
  Camera,
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Sparkles,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Tag,
  Package,
  Plus,
  Minus
} from 'lucide-react';

interface SmartListingPageProps {
  onNavigate: (route: string) => void;
}

export const SmartListingPage: React.FC<SmartListingPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { t, language } = useTranslation();

  // Wizard Step: 1 to 7, plus 8 for Success
  const [step, setStep] = useState<number>(1);

  // Form State
  const [crop, setCrop] = useState<string>('Tomato');
  const [customCrop, setCustomCrop] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(500);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [grade, setGrade] = useState<ProduceGrade>('Grade A');
  const [photoUploaded, setPhotoUploaded] = useState<boolean>(false);
  const [harvestDate, setHarvestDate] = useState<string>('Within 3 days');
  const [customHarvestDate, setCustomHarvestDate] = useState<string>('');
  const [expectedPrice, setExpectedPrice] = useState<number>(35);
  const [showPriceBenchmark, setShowPriceBenchmark] = useState<boolean>(false);

  // Farmer's location from profile or custom
  const [district, setDistrict] = useState<string>((currentUser as any)?.district || 'South 24 Parganas');
  const [village, setVillage] = useState<string>((currentUser as any)?.village || 'Champahati');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Voice recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Published Listing outcome
  const [publishedListing, setPublishedListing] = useState<FarmerProduceListing | null>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'bn' ? 'bn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);
        parseVoiceInput(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setVoiceError(event.error === 'not-allowed' ? 'Microphone access denied' : 'Could not recognize speech');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      // Graceful simulated voice fallback if browser doesn't have webkitSpeechRecognition
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const demoPhrase =
          language === 'bn'
            ? 'আমার ৫০০ কেজি টমেটো আছে'
            : language === 'hi'
            ? 'मेरे पास 500 किलो टमाटर है'
            : 'I have 500 kg tomatoes';
        setVoiceTranscript(demoPhrase);
        parseVoiceInput(demoPhrase);
      }, 1500);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
      }
    }
  };

  const parseVoiceInput = (text: string) => {
    const lower = text.toLowerCase();

    // Check for crop
    if (lower.includes('টমেটো') || lower.includes('tomato') || lower.includes('टमाटर')) {
      setCrop('Tomato');
    } else if (lower.includes('আলু') || lower.includes('potato') || lower.includes('आलू')) {
      setCrop('Potato');
    } else if (lower.includes('ধান') || lower.includes('চাল') || lower.includes('rice') || lower.includes('चावल')) {
      setCrop('Rice');
    } else if (lower.includes('বেগুন') || lower.includes('brinjal') || lower.includes('बैंगन')) {
      setCrop('Brinjal');
    } else if (lower.includes('পেঁয়াজ') || lower.includes('onion') || lower.includes('प्याज')) {
      setCrop('Onion');
    } else if (lower.includes('বাঁধাকপি') || lower.includes('cabbage') || lower.includes('पत्तागोभी')) {
      setCrop('Cabbage');
    }

    // Extract quantity numbers
    const matches = text.match(/\d+/);
    if (matches && matches[0]) {
      const num = parseInt(matches[0]);
      if (num > 0) setQuantity(num);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && (!crop || (crop === 'Other' && !customCrop.trim()))) {
      return;
    }
    if (step === 2 && quantity < 5) {
      setQuantityError(t('smartListing.minQuantityError') || 'Minimum listing quantity is 5 kg.');
      return;
    }
    if (step === 4 && harvestDate === 'Custom Date' && !customHarvestDate) {
      return;
    }
    if (step === 5 && expectedPrice <= 0) {
      return;
    }
    setQuantityError(null);
    if (step < 7) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onNavigate('farmer-dashboard');
    }
  };

  const handlePhotoUpload = () => {
    setPhotoUploaded(true);
    setGrade('Grade A');
  };

  // Generate AI Recommendation payload
  const generateAiRecommendation = (): AIRecommendation => {
    const isTomato = crop === 'Tomato';
    const isReadySoon = harvestDate.includes('3') || harvestDate.includes('Today') || harvestDate.includes('Tomorrow');

    return {
      demandLevel: isTomato ? 'High demand' : 'Medium demand',
      suggestedPriceMin: isTomato ? 32 : 18,
      suggestedPriceMax: isTomato ? 36 : 22,
      sellingStrategy: `Allocate ~${Math.round(quantity * 0.6)} kg to current pre-booking buyers at ₹35/kg, and reserve ${Math.round(quantity * 0.4)} kg for spot delivery.`,
      sellingStrategyBn: `বর্তমান অগ্রিম বুকিং দেওয়া ক্রেতাদের জন্য ~${Math.round(quantity * 0.6)} কেজি প্রতি কেজি ৩৫ টাকায় বরাদ্দ করুন এবং বাকি ${Math.round(quantity * 0.4)} কেজি অতিরিক্ত চাহিদার জন্য রাখুন।`,
      sellingStrategyHi: `लगभग ${Math.round(quantity * 0.6)} किग्रा मौजूदा खरीदारों को ₹35/किग्रा पर आवंटित करें और शेष ${Math.round(quantity * 0.4)} किग्रा उच्च मांग के लिए रखें।`,
      marketOpportunity: 'Wholesale arrivals in Posta and Sealdah markets are lower by ~18% this week.',
      marketOpportunityBn: 'এই সপ্তাহে কলকাতার বড় বাজারে সরবরাহ ১৮% হ্রাস পাওয়ায় ভালো দর পাওয়ার সুযোগ রয়েছে।',
      marketOpportunityHi: 'इस सप्ताह थोक मंडियों में आवक 18% कम रहने से मांग में भारी तेजी है।',
      freshnessRisk: isReadySoon ? 'Low now • Harvest window optimal within 4 days.' : 'Optimal ambient harvest window.',
      freshnessRiskBn: 'এখন ঝুঁকি কম • আগামী ৪ দিনের মধ্যে ফসল তোলার সময় অত্যন্ত অনুকূল।',
      freshnessRiskHi: 'अभी ताजगी का जोखिम कम है • 4 दिनों के भीतर कटाई सर्वोत्तम है।',
      recommendedAction: 'Connect with matched buyers prior to harvest to schedule shared vehicle pickup.',
      recommendedActionBn: 'ফসল কাটার পূর্বেই ক্রেতাদের সাথে বুকিং নিশ্চিত করে যৌথ গাড়ির সময় নির্ধারণ করুন।',
      recommendedActionHi: 'कटाई से पहले ही सत्यापित खरीदारों से संपर्क कर वाहन पिकअप तय करें।',
      whyFactors: [
        {
          title: 'High Demand Index',
          titleBn: 'উচ্চ চাহিদা সূচক',
          titleHi: 'उच्च मांग सूचकांक',
          description: 'Regional buyer demand inquiries for this crop are up 24% over the past 72 hours.',
          descriptionBn: 'গত ৭২ ঘণ্টায় এই ফসলের জন্য ক্রেতাদের অনুসন্ধানের পরিমাণ ২৪% বৃদ্ধি পেয়েছে।',
          descriptionHi: 'पिछले 72 घंटों में इस फसल के लिए खरीदारों की मांग 24% बढ़ी है।'
        },
        {
          title: 'Optimal Lot Size',
          titleBn: 'উপযুক্ত লট সাইজ',
          titleHi: 'अनुकूल लॉट साइज',
          description: `Your ${quantity} kg volume fits standard city mini-van transport capacity without empty space overhead.`,
          descriptionBn: `আপনার ${quantity} কেজি পরিমাণ যৌথ পিকআপ ভ্যানের ধারণক্ষমতার সাথে যথাযথভাবে সামঞ্জস্যপূর্ণ।`,
          descriptionHi: `आपकी ${quantity} किग्रा मात्रा साझा वाहन परिवहन क्षमता के बिल्कुल अनुकूल है।`
        },
        {
          title: 'Freshness Window',
          titleBn: 'তাজাত্ব বজায় থাকার সময়',
          titleHi: 'ताजगी की अवधि',
          description: 'Grade A classification ensures top pricing for 4-5 days post-harvest.',
          descriptionBn: 'গ্রেড এ মানের ফসল তোলার পর ৪-৫ দিন সম্পূর্ণ তাজা অবস্থায় সেরা দর পাওয়া যায়।',
          descriptionHi: 'ग्रेड ए फसल कटाई के बाद 4-5 दिनों तक उच्चतम मूल्य प्राप्त करती है।'
        }
      ]
    };
  };

  const handleGetAiAdvisor = () => {
    // Save draft in state & navigate to AI advisor screen
    const draft: Partial<FarmerProduceListing> = {
      crop,
      quantity,
      grade,
      harvestDate: harvestDate === 'Custom Date' ? customHarvestDate : harvestDate,
      expectedPrice,
      location: { district, village },
    };
    sessionStorage.setItem('krishok_bandhu_draft_listing', JSON.stringify(draft));
    onNavigate('farmer-ai-advisor');
  };

  const handlePublish = () => {
    if (!crop || (crop === 'Other' && !customCrop.trim())) {
      setStep(1);
      return;
    }

    if (quantity < 5) {
      setQuantityError(t('smartListing.minQuantityError') || 'Minimum listing quantity is 5 kg.');
      setStep(2);
      return;
    }

    if (expectedPrice <= 0) {
      setStep(5);
      return;
    }

    setQuantityError(null);
    const listingId = `PRD-${Date.now().toString().slice(-4)}`;
    const newListing: FarmerProduceListing = {
      id: listingId,
      farmerId: currentUser?.id || 'f-101',
      farmerName: currentUser?.name || 'Ramesh Mondal',
      farmerMobile: currentUser?.mobile || '9830123456',
      crop,
      quantity,
      unit: 'kg',
      grade,
      expectedPrice,
      harvestDate: harvestDate === 'Custom Date' ? customHarvestDate : harvestDate,
      location: { district, village },
      status: 'Looking for Buyers',
      createdAt: new Date().toISOString().split('T')[0],
      aiRecommendation: generateAiRecommendation(),
    };

    // Save in localStorage for persistent access by Farmer Dashboard & Buyer views
    const existing = JSON.parse(localStorage.getItem('krishok_bandhu_farmer_listings') || '[]');
    localStorage.setItem('krishok_bandhu_farmer_listings', JSON.stringify([newListing, ...existing]));

    setPublishedListing(newListing);
    setStep(8); // Success state
  };

  const cropOptions = [
    { id: 'Tomato', label: t('smartListing.cropTomato'), emoji: '🍅' },
    { id: 'Potato', label: t('smartListing.cropPotato'), emoji: '🥔' },
    { id: 'Rice', label: t('smartListing.cropRice'), emoji: '🌾' },
    { id: 'Onion', label: t('smartListing.cropOnion'), emoji: '🧅' },
    { id: 'Brinjal', label: t('smartListing.cropBrinjal'), emoji: '🍆' },
    { id: 'Cabbage', label: t('smartListing.cropCabbage'), emoji: '🥬' },
    { id: 'Other', label: t('smartListing.cropOther'), emoji: '🌱' },
  ];

  const gradeOptions: { id: ProduceGrade; title: string; desc: string }[] = [
    { id: 'Grade A', title: t('smartListing.gradeA'), desc: t('smartListing.gradeADesc') },
    { id: 'Grade B', title: t('smartListing.gradeB'), desc: t('smartListing.gradeBDesc') },
    { id: 'Grade C', title: t('smartListing.gradeC'), desc: t('smartListing.gradeCDesc') },
    { id: 'Not sure', title: t('smartListing.gradeNotSure'), desc: t('smartListing.gradeNotSureDesc') },
  ];

  const harvestOptions = [
    { id: 'Ready Today', label: t('smartListing.readyToday') },
    { id: 'Ready Tomorrow', label: t('smartListing.readyTomorrow') },
    { id: 'Within 3 days', label: t('smartListing.ready3Days') },
    { id: 'Within 7 days', label: t('smartListing.ready7Days') },
    { id: 'Custom Date', label: t('smartListing.readyCustom') },
  ];

  // ========================================================
  // STEP 8: SUCCESS STATE
  // ========================================================
  if (step === 8 && publishedListing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 text-center animate-in fade-in zoom-in-95 duration-200">
        <Card className="p-8 border-2 border-emerald-500 bg-white shadow-lg space-y-5">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-4xl mx-auto shadow-xs">
            🎉
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            {t('smartListing.publishSuccessTitle')}
          </h2>
          <p className="text-sm text-slate-600">
            {t('smartListing.publishSuccessDesc')}
          </p>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-left space-y-2 text-xs sm:text-sm text-slate-800">
            <div className="flex justify-between pb-1 border-b border-emerald-200">
              <span className="text-slate-500">{t('smartListing.produceId')}:</span>
              <span className="font-bold text-emerald-950 font-mono">{publishedListing.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('smartListing.summaryCrop')}:</span>
              <span className="font-bold">{publishedListing.crop}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('smartListing.summaryQuantity')}:</span>
              <span className="font-bold">{publishedListing.quantity} {t('smartListing.unitKg')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('smartListing.summaryGrade')}:</span>
              <span className="font-bold text-emerald-800">{publishedListing.grade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('smartListing.summaryPrice')}:</span>
              <span className="font-bold text-emerald-900">₹{publishedListing.expectedPrice} / {t('smartListing.unitKg')}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-emerald-200">
              <span className="text-slate-500">{t('common.status')}:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                {t('smartListing.statusLookingBuyers')}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              variant="farmer"
              size="lg"
              fullWidth
              onClick={() => onNavigate('farmer-matched-buyers')}
            >
              {t('smartListing.viewMatchedBuyersButton')} →
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => onNavigate('farmer-dashboard')}
            >
              {t('smartListing.backToDashboardButton')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-8 text-left space-y-5 pb-24">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevStep}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 min-h-[40px] px-2 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')}</span>
        </button>

        <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full">
          {t('register.step')} {step} {t('register.of')} 7
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-emerald-700 h-full transition-all duration-300"
          style={{ width: `${(step / 7) * 100}%` }}
        />
      </div>

      {/* ======================================================== */}
      {/* STEP 1: CROP SELECTION + VOICE INPUT */}
      {/* ======================================================== */}
      {step === 1 && (
        <Card className="p-6 border border-slate-200 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t('register.step')} 1
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              {t('smartListing.step1Title')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('smartListing.step1Subtitle')}
            </p>
          </div>

          {/* Voice Input Button */}
          <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleVoice}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white cursor-pointer shadow-md transition-all ${
                  isListening
                    ? 'bg-rose-600 animate-pulse scale-105'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
                title={t('smartListing.voiceSpeak')}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <div>
                <div className="font-bold text-sm text-emerald-950">
                  {isListening ? t('smartListing.voiceListening') : t('smartListing.voiceSpeak')}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {t('smartListing.voiceHelp')}
                </div>
              </div>
            </div>
          </div>

          {voiceTranscript && (
            <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-950 flex items-center justify-between">
              <span>{t('smartListing.voiceDetected')} "{voiceTranscript}"</span>
              <span className="text-emerald-700">✓</span>
            </div>
          )}

          {voiceError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {voiceError}
            </div>
          )}

          {/* Popular Crop Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              {t('smartListing.popularCrops')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {cropOptions.map((opt) => {
                const isSelected = crop === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCrop(opt.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs scale-[1.02]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-sm">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {crop === 'Other' && (
            <Input
              label="Enter Crop Name"
              placeholder="e.g., Mustard, Cauliflower, Mango..."
              value={customCrop}
              onChange={(e) => setCustomCrop(e.target.value)}
              autoFocus
            />
          )}

          <Button
            variant="farmer"
            size="xl"
            fullWidth
            onClick={() => {
              if (quantity < 5) {
                setQuantityError(t('smartListing.minQuantityError') || 'Minimum listing quantity is 5 kg.');
                return;
              }
              setQuantityError(null);
              handleNextStep();
            }}
            className="mt-4"
          >
            {t('common.next')} →
          </Button>
        </Card>
      )}

      {/* ======================================================== */}
      {/* STEP 2: QUANTITY WITH +/- CONTROLS */}
      {/* ======================================================== */}
      {step === 2 && (
        <Card className="p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t('register.step')} 2
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              {t('smartListing.step2Title')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('smartListing.step2Subtitle')} ({crop})
            </p>
          </div>

          {/* Big touch increment/decrement card */}
          <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  const nextQty = Math.max(5, quantity - 50);
                  setQuantity(nextQty);
                  setQuantityError(nextQty >= 5 ? null : t('smartListing.minQuantityError'));
                }}
                className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-300 hover:border-slate-400 active:scale-95 text-slate-800 flex items-center justify-center text-2xl font-bold cursor-pointer shadow-xs"
                title="Decrease 50 kg"
              >
                <Minus className="w-6 h-6" />
              </button>

              <div className="flex-1 max-w-[180px]">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10) || 0;
                    setQuantity(value);
                    setQuantityError(value >= 5 ? null : (t('smartListing.minQuantityError') || 'Minimum listing quantity is 5 kg.'));
                  }}
                  className="w-full text-center text-4xl font-extrabold text-emerald-950 bg-white border-2 border-emerald-600 rounded-2xl py-2 px-3 focus:outline-none shadow-xs"
                />
                <span className="block text-xs font-bold text-slate-500 uppercase mt-1">
                  {t('smartListing.unitKg')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextQty = quantity + 50;
                  setQuantity(nextQty);
                  setQuantityError(nextQty >= 5 ? null : t('smartListing.minQuantityError'));
                }}
                className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-300 hover:border-slate-400 active:scale-95 text-slate-800 flex items-center justify-center text-2xl font-bold cursor-pointer shadow-xs"
                title="Increase 50 kg"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Chips for Standard Indian Harvest Volumes */}
            {quantityError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 font-semibold">
                {quantityError}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
              {[100, 250, 500, 1000, 2500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    quantity === preset
                      ? 'bg-emerald-800 text-white border-emerald-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset} kg
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={handlePrevStep}>
              {t('common.back')}
            </Button>
            <Button variant="farmer" size="lg" fullWidth onClick={handleNextStep}>
              {t('common.next')} →
            </Button>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* STEP 3: QUALITY / GRADE + AI CAMERA PHOTO ESTIMATE */}
      {/* ======================================================== */}
      {step === 3 && (
        <Card className="p-6 border border-slate-200 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t('register.step')} 3
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              {t('smartListing.step3Title')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('smartListing.step3Subtitle')}
            </p>
          </div>

          <div className="space-y-2.5">
            {gradeOptions.map((opt) => {
              const isSelected = grade === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGrade(opt.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-base font-bold">{opt.title}</div>
                    <div className="text-xs text-slate-500 font-normal mt-0.5">{opt.desc}</div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* AI Photo Quality Assessment Prompt when "Not sure" is chosen */}
          {grade === 'Not sure' && (
            <div className="p-4 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-amber-950">
                    {t('smartListing.aiQualityNotice')}
                  </div>
                  <div className="text-xs text-amber-900 mt-0.5">
                    {t('smartListing.aiQualityHelp')}
                  </div>
                </div>
              </div>

              {!photoUploaded ? (
                <button
                  type="button"
                  onClick={handlePhotoUpload}
                  className="w-full py-3 px-4 rounded-xl border border-amber-400 bg-white hover:bg-amber-100/60 text-amber-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Camera className="w-4 h-4 text-amber-700" />
                  <span>{t('smartListing.takePhoto')}</span>
                </button>
              ) : (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{t('smartListing.photoAnalyzed')}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={handlePrevStep}>
              {t('common.back')}
            </Button>
            <Button variant="farmer" size="lg" fullWidth onClick={handleNextStep}>
              {t('common.next')} →
            </Button>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* STEP 4: HARVEST / READY DATE */}
      {/* ======================================================== */}
      {step === 4 && (
        <Card className="p-6 border border-slate-200 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t('register.step')} 4
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              {t('smartListing.step4Title')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('smartListing.step4Subtitle')}
            </p>
          </div>

          <div className="space-y-2.5">
            {harvestOptions.map((opt) => {
              const isSelected = harvestDate === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setHarvestDate(opt.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-base">{opt.label}</span>
                  {isSelected && <Check className="w-5 h-5 text-emerald-700 shrink-0" />}
                </button>
              );
            })}
          </div>

          {harvestDate === 'Custom Date' && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('smartListing.selectCustomDate')}
              </label>
              <input
                type="date"
                value={customHarvestDate}
                onChange={(e) => setCustomHarvestDate(e.target.value)}
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:border-emerald-700 focus:outline-none"
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={handlePrevStep}>
              {t('common.back')}
            </Button>
            <Button variant="farmer" size="lg" fullWidth onClick={handleNextStep}>
              {t('common.next')} →
            </Button>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* STEP 5: EXPECTED PRICE + BENCHMARK RECOMMENDATION */}
      {/* ======================================================== */}
      {step === 5 && (
        <Card className="p-6 border border-slate-200 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t('register.step')} 5
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              {t('smartListing.step5Title')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('smartListing.step5Subtitle')}
            </p>
          </div>

          <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t('smartListing.priceInputLabel')}
            </label>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-800">₹</span>
              <input
                type="number"
                min="1"
                step="1"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(parseInt(e.target.value) || 0)}
                className="text-3xl font-extrabold text-emerald-950 bg-white border-2 border-emerald-600 rounded-2xl py-2 px-4 w-36 text-center focus:outline-none"
              />
              <span className="text-sm font-bold text-slate-500">/ {t('smartListing.unitKg')}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowPriceBenchmark(true);
                setExpectedPrice(34);
              }}
              className="text-xs text-emerald-800 font-bold hover:underline block pt-1 cursor-pointer"
            >
              💡 {t('smartListing.dontKnowPriceButton')}
            </button>
          </div>

          {showPriceBenchmark && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-xs space-y-1 animate-in fade-in">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>{t('smartListing.benchmarkNotice')}</span>
              </div>
              <p className="text-emerald-900">
                {t('smartListing.benchmarkSuggested')}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={handlePrevStep}>
              {t('common.back')}
            </Button>
            <Button variant="farmer" size="lg" fullWidth onClick={handleNextStep}>
              {t('common.next')} →
            </Button>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* STEP 6: LOCATION CONFIRMATION */}
      {/* ======================================================== */}
      {step === 6 && (
        <Card className="p-6 border border-slate-200 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t('register.step')} 6
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              {t('smartListing.step6Title')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('smartListing.step6Subtitle')}
            </p>
          </div>

          <div className="p-5 bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl space-y-2">
            <span className="text-xs text-slate-500 block">
              {t('smartListing.savedLocationNote')}
            </span>
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <MapPin className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{village}, {district}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="text-xs font-bold text-emerald-800 hover:underline pt-2 inline-block cursor-pointer"
            >
              ✏️ {t('smartListing.changeLocation')}
            </button>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={handlePrevStep}>
              {t('common.back')}
            </Button>
            <Button variant="farmer" size="lg" fullWidth onClick={handleNextStep}>
              {t('common.next')} →
            </Button>
          </div>

          {/* Modal to change location */}
          <Modal
            isOpen={isLocationModalOpen}
            onClose={() => setIsLocationModalOpen(false)}
            title={t('smartListing.changeLocation')}
          >
            <div className="space-y-4 text-left">
              <Input
                label={t('smartListing.villageLabel')}
                value={village}
                onChange={(e) => setVillage(e.target.value)}
              />
              <Input
                label={t('smartListing.districtLabel')}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
              <Button
                variant="farmer"
                size="md"
                fullWidth
                onClick={() => setIsLocationModalOpen(false)}
              >
                {t('common.save')}
              </Button>
            </div>
          </Modal>
        </Card>
      )}

      {/* ======================================================== */}
      {/* STEP 7: REVIEW SCREEN + AI ADVISOR / PUBLISH ACTIONS */}
      {/* ======================================================== */}
      {step === 7 && (
        <Card className="p-6 border border-slate-200 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t('register.step')} 7
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              {t('smartListing.step7Title')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('smartListing.step7Subtitle')}
            </p>
          </div>

          {/* Produce Summary Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">{t('smartListing.summaryCrop')}:</span>
              <strong className="text-slate-900 text-base">{crop === 'Other' ? customCrop : crop}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">{t('smartListing.summaryQuantity')}:</span>
              <strong className="text-slate-900">{quantity} {t('smartListing.unitKg')}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">{t('smartListing.summaryGrade')}:</span>
              <strong className="text-emerald-800">{grade}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">{t('smartListing.summaryHarvest')}:</span>
              <strong className="text-slate-900">{harvestDate === 'Custom Date' ? customHarvestDate : harvestDate}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">{t('smartListing.summaryPrice')}:</span>
              <strong className="text-emerald-900 text-base">₹{expectedPrice} / {t('smartListing.unitKg')}</strong>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">{t('smartListing.summaryLocation')}:</span>
              <strong className="text-slate-900">{village}, {district}</strong>
            </div>
          </div>

          {/* Action Buttons: Get AI Advice & Publish */}
          <div className="space-y-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleGetAiAdvisor}
              className="border-2 border-purple-300 text-purple-950 hover:bg-purple-50 font-bold flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-purple-700" />
              <span>{t('smartListing.getAiAdviceButton')}</span>
            </Button>

            <Button
              type="button"
              variant="farmer"
              size="xl"
              fullWidth
              onClick={handlePublish}
              className="font-bold text-lg"
            >
              {t('smartListing.publishButton')} →
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={handlePrevStep}
            >
              {t('common.back')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
