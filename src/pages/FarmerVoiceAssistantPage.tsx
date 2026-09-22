import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Square,
  Sparkles,
  ArrowRight,
  Send,
  RotateCcw,
  AlertCircle,
  Users,
  Package,
  TrendingUp,
  Truck,
  AlertTriangle,
  HelpCircle,
  Edit3
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { requestAiChat, AiChatResponse } from '../services/apiClient';

interface Props {
  onNavigate: (route: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'farmer' | 'ai';
  text: string;
  time: string;
  responseMeta?: {
    mode: 'ai' | 'prototype';
    label: string;
    suggestedAction?: {
      type: string;
      label: string;
      route: string;
    };
  };
}

export const FarmerVoiceAssistantPage: React.FC<Props> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { t, language } = useTranslation();

  // Voice recognition states (lazy initialized to avoid cascading renders)
  const [sttSupported, setSttSupported] = useState<boolean>(
    () => typeof window !== 'undefined' && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  );
  const [ttsSupported] = useState<boolean>(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window
  );
  const [voiceState, setVoiceState] = useState<'ready' | 'listening' | 'processing' | 'answering' | 'error'>('ready');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isEditingTranscript, setIsEditingTranscript] = useState<boolean>(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState<boolean>(false);
  const [activeTtsId, setActiveTtsId] = useState<string | null>(null);

  // Fallback direct text input
  const [typedQuestion, setTypedQuestion] = useState<string>('');
  const [showTypeInput, setShowTypeInput] = useState<boolean>(false);

  // Session conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // SpeechRecognition reference
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null);

  // Farmer Farm Profile context (from session/local state or currentUser)
  const farmerId = currentUser?.id || 'f-101';
  const farmerName = currentUser?.name || 'Ramesh Mondal';
  const location = (currentUser as any)?.district || 'South 24 Parganas';
  const landArea = (currentUser as any)?.farmSizeAcres ? `${(currentUser as any).farmSizeAcres} acres` : '2.5 acres';
  const soilType = (currentUser as any)?.soilType || 'Loamy soil';
  const waterSource = (currentUser as any)?.waterSource || 'Moderate pond/canal';

  // Check for any active listing in localStorage
  const currentListing = useMemo(() => {
    try {
      const saved = localStorage.getItem('krishok_bandhu_farmer_listings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const item = parsed[0];
          return `${item.crop || 'Tomato'} (${item.quantity || 500} ${item.unit || 'kg'}, ${item.grade || 'Grade A'})`;
        }
      }
    } catch {
      // ignore
    }
    return 'Tomato (500 kg, Grade A)';
  }, []);

  // Configure Speech Recognition whenever language changes
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Locale mapping
      if (language === 'bn') {
        recognition.lang = 'bn-IN';
      } else if (language === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setVoiceState('listening');
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setTranscript(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        setVoiceState('error');
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceError(t('voiceAssistant.permissionDenied'));
        } else if (event.error === 'no-speech') {
          setVoiceError(t('voiceAssistant.noSpeech'));
        } else {
          setVoiceError(`${t('voiceAssistant.error')}: ${event.error || 'Check microphone'}`);
        }
      };

      recognition.onend = () => {
        setVoiceState((prev) => (prev === 'listening' ? 'ready' : prev));
      };

      recognitionRef.current = recognition;
    } catch {
      setSttSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [language, t]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Toggle Voice Input
  const handleToggleVoice = () => {
    if (!sttSupported) {
      setShowTypeInput(true);
      return;
    }

    if (voiceState === 'listening') {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setVoiceState('ready');
      return;
    }

    // Start listening
    setVoiceError(null);
    setTranscript('');
    try {
      recognitionRef.current?.start();
    } catch (_err: unknown) {
      // If already started or failed
      try {
        recognitionRef.current?.abort();
        recognitionRef.current?.start();
      } catch (_restartErr: unknown) {
        setVoiceState('error');
        setVoiceError(t('voiceAssistant.permissionDenied'));
      }
    }
  };

  // Submit Query to AI
  const handleSubmitQuery = async (queryText?: string) => {
    const textToSend = (queryText || transcript || typedQuestion).trim();
    if (!textToSend) return;

    // Stop listening if active
    if (voiceState === 'listening') {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    }

    // Stop any ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeakingTts(false);
      setActiveTtsId(null);
    }

    const userMessageId = `msg-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newFarmerMsg: ChatMessage = {
      id: userMessageId,
      sender: 'farmer',
      text: textToSend,
      time: timeStr,
    };

    setMessages((prev) => [...prev, newFarmerMsg]);
    setTranscript('');
    setTypedQuestion('');
    setIsEditingTranscript(false);
    setVoiceState('processing');

    // Build rich context from available farmer data
    const context: Record<string, unknown> = {
      farmerId,
      farmerName,
      location,
      landAreaAcres: parseFloat(landArea) || 2.5,
      soilType,
      waterAvailability: waterSource,
      currentProduce: currentListing,
    };

    try {
      const response: AiChatResponse | null = await requestAiChat(textToSend, context, language);

      const aiMessageId = `msg-${Date.now() + 1}`;
      const aiResponseText = response?.answer || t('copilot.offlineAnswer');

      const newAiMsg: ChatMessage = {
        id: aiMessageId,
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responseMeta: {
          mode: response?.mode || 'prototype',
          label: response?.label || t('voiceAssistant.prototypeBadge'),
          suggestedAction: response?.suggestedAction,
        },
      };

      setMessages((prev) => [...prev, newAiMsg]);
      setVoiceState('ready');

      // Auto-trigger TTS optional speech
      playTts(aiMessageId, aiResponseText);
    } catch {
      setVoiceState('error');
      setVoiceError('Could not process AI request. Please try again.');
    }
  };

  // Play Text-to-Speech
  const playTts = (messageId: string, text: string) => {
    if (!ttsSupported || !synthRef.current) return;

    try {
      synthRef.current.cancel();

      if (isSpeakingTts && activeTtsId === messageId) {
        setIsSpeakingTts(false);
        setActiveTtsId(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower for clarity
      utterance.pitch = 1.0;

      // Select voice based on current language
      const voices = synthRef.current.getVoices();
      if (language === 'bn') {
        utterance.lang = 'bn-IN';
        const bnVoice = voices.find((v) => v.lang.startsWith('bn'));
        if (bnVoice) utterance.voice = bnVoice;
      } else if (language === 'hi') {
        utterance.lang = 'hi-IN';
        const hiVoice = voices.find((v) => v.lang.startsWith('hi'));
        if (hiVoice) utterance.voice = hiVoice;
      } else {
        utterance.lang = 'en-IN';
        const enVoice = voices.find((v) => v.lang.startsWith('en-IN') || v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onstart = () => {
        setIsSpeakingTts(true);
        setActiveTtsId(messageId);
      };

      utterance.onend = () => {
        setIsSpeakingTts(false);
        setActiveTtsId(null);
      };

      utterance.onerror = () => {
        setIsSpeakingTts(false);
        setActiveTtsId(null);
      };

      synthRef.current.speak(utterance);
    } catch {
      setIsSpeakingTts(false);
      setActiveTtsId(null);
    }
  };

  const stopTts = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeakingTts(false);
    setActiveTtsId(null);
  };

  // Quick Questions
  const quickQuestions = [
    { key: 'qGrow', text: t('voiceAssistant.qGrow') },
    { key: 'qDemand', text: t('voiceAssistant.qDemand') },
    { key: 'qPrice', text: t('voiceAssistant.qPrice') },
    { key: 'qBuyers', text: t('voiceAssistant.qBuyers') },
    { key: 'qMatchReason', text: t('voiceAssistant.qMatchReason') },
    { key: 'qTransport', text: t('voiceAssistant.qTransport') },
    { key: 'qCancel', text: t('voiceAssistant.qCancel') },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-left pb-28">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              {t('voiceAssistant.prototypeBadge')}
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              • {language === 'bn' ? 'বাংলা' : language === 'hi' ? 'हिंदी' : 'English (India)'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {t('voiceAssistant.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('voiceAssistant.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector variant="compact" />
        </div>
      </div>

      {/* 2. Top Grid: Farmer Context Card & Assistant Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Farm Context Card */}
        <Card className="p-4 sm:p-5 border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 to-white space-y-3 md:col-span-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
              🌾 {t('voiceAssistant.yourFarm')}
            </h2>
            <span className="text-[10px] font-semibold bg-emerald-100/80 text-emerald-900 px-2 py-0.5 rounded-md">
              {farmerName}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-emerald-100/60">
              <span className="text-slate-500">{t('voiceAssistant.location')}:</span>
              <span className="font-bold text-slate-800">{location}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-emerald-100/60">
              <span className="text-slate-500">{t('voiceAssistant.landArea')}:</span>
              <span className="font-bold text-slate-800">{landArea}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-emerald-100/60">
              <span className="text-slate-500">{t('voiceAssistant.soil')}:</span>
              <span className="font-bold text-slate-800">{soilType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-emerald-100/60">
              <span className="text-slate-500">{t('voiceAssistant.water')}:</span>
              <span className="font-bold text-slate-800">{waterSource}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">{t('voiceAssistant.currentCrop')}:</span>
              <span className="font-bold text-emerald-900">{currentListing}</span>
            </div>
          </div>
        </Card>

        {/* Voice Interaction Hero Card */}
        <Card className="p-5 sm:p-6 border border-slate-200 bg-white flex flex-col items-center justify-center text-center space-y-4 md:col-span-2 shadow-2xs">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                voiceState === 'listening'
                  ? 'bg-amber-500 animate-ping'
                  : voiceState === 'processing'
                  ? 'bg-blue-500 animate-pulse'
                  : voiceState === 'error'
                  ? 'bg-rose-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {voiceState === 'listening'
                ? t('voiceAssistant.listening')
                : voiceState === 'processing'
                ? t('voiceAssistant.processing')
                : voiceState === 'error'
                ? t('voiceAssistant.error')
                : t('voiceAssistant.ready')}
            </span>
          </div>

          {/* Big Accessible Microphone Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            aria-label={voiceState === 'listening' ? t('voiceAssistant.stopSpeaking') : t('voiceAssistant.speak')}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-md focus:outline-hidden focus:ring-4 focus:ring-emerald-300 ${
              voiceState === 'listening'
                ? 'bg-amber-500 hover:bg-amber-600 text-white ring-8 ring-amber-100 animate-pulse'
                : voiceState === 'processing'
                ? 'bg-slate-200 text-slate-600 cursor-wait'
                : 'bg-[#0F3E26] hover:bg-[#185334] text-white hover:scale-105 active:scale-95'
            }`}
          >
            {voiceState === 'listening' ? (
              <MicOff className="w-10 h-10 sm:w-12 sm:h-12" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
            )}
            <span className="text-[11px] font-bold mt-1 tracking-wide">
              {voiceState === 'listening' ? t('voiceAssistant.stopSpeaking') : t('voiceAssistant.speak')}
            </span>
          </button>

          {/* Informative Hint / Error */}
          {voiceError ? (
            <div className="p-2.5 px-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{voiceError}</span>
            </div>
          ) : !sttSupported ? (
            <div className="p-2.5 px-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-2 animate-in fade-in">
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-700" />
              <span>{t('voiceAssistant.unsupported')}</span>
            </div>
          ) : (
            <p className="text-xs text-slate-500 max-w-sm">
              {voiceState === 'listening'
                ? (language === 'bn' ? 'স্পষ্টভাবে আপনার প্রশ্ন বলুন...' : language === 'hi' ? 'स्पष्ट रूप से अपना प्रश्न बोलें...' : 'Speak your question clearly...')
                : (language === 'bn' ? 'মাইক্রোফোনে চাপুন এবং বাংলায় কথা বলুন' : language === 'hi' ? 'माइक दबाएं और हिंदी में बात करें' : 'Tap the microphone and speak your query')}
            </p>
          )}

          {/* Toggle Type Instead */}
          <button
            type="button"
            onClick={() => setShowTypeInput(!showTypeInput)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
          >
            {showTypeInput
              ? (language === 'bn' ? 'কিবোর্ড লুকান' : language === 'hi' ? 'कीबोर्ड छिपाएं' : 'Hide typing')
              : t('voiceAssistant.typeInstead')}
          </button>
        </Card>
      </div>

      {/* 3. Transcript & Live Edit Section */}
      {(transcript || isEditingTranscript) && (
        <Card className="p-4 sm:p-5 border border-amber-300 bg-amber-50/50 space-y-3 rounded-2xl animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-amber-800" />
              {t('voiceAssistant.youSaid')}
            </span>
            <button
              type="button"
              onClick={() => setIsEditingTranscript(!isEditingTranscript)}
              className="text-xs text-amber-800 hover:text-amber-950 font-medium underline cursor-pointer"
            >
              {isEditingTranscript ? 'Done' : 'Edit'}
            </button>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={2}
            className="w-full text-sm sm:text-base font-semibold text-slate-900 bg-white border border-amber-200 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            placeholder={t('voiceAssistant.typePlaceholder')}
          />

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setTranscript('');
                setIsEditingTranscript(false);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {t('voiceAssistant.clear')}
            </button>
            <button
              type="button"
              onClick={() => handleSubmitQuery()}
              disabled={!transcript.trim() || voiceState === 'processing'}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <span>{t('voiceAssistant.askAi')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>
      )}

      {/* 4. Optional Direct Typing Input Box */}
      {showTypeInput && (
        <Card className="p-4 border border-slate-200 bg-white space-y-2 rounded-2xl animate-in fade-in">
          <label className="block text-xs font-bold text-slate-700">
            {t('voiceAssistant.typeInstead')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={typedQuestion}
              onChange={(e) => setTypedQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitQuery(typedQuestion);
              }}
              placeholder={t('voiceAssistant.typePlaceholder')}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-normal focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="button"
              onClick={() => handleSubmitQuery(typedQuestion)}
              disabled={!typedQuestion.trim() || voiceState === 'processing'}
              className="px-4 py-2.5 rounded-xl bg-[#0F3E26] hover:bg-[#175233] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('voiceAssistant.send')}</span>
            </button>
          </div>
        </Card>
      )}

      {/* 5. Quick Farmer Questions Grid */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          💡 {t('voiceAssistant.quickTitle')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q) => (
            <button
              key={q.key}
              type="button"
              onClick={() => handleSubmitQuery(q.text)}
              disabled={voiceState === 'processing'}
              className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-semibold text-slate-800 hover:text-emerald-950 transition-colors cursor-pointer text-left shadow-2xs active:scale-95 disabled:opacity-50"
            >
              💬 {q.text}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Conversation & AI Answer Display */}
      {messages.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-sm font-extrabold text-slate-900">
              {t('voiceAssistant.aiResponseTitle')}
            </h2>
            <button
              type="button"
              onClick={() => setMessages([])}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              {t('voiceAssistant.clear')}
            </button>
          </div>

          <div className="space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'farmer' ? 'items-end' : 'items-start'
                }`}
              >
                {msg.sender === 'farmer' ? (
                  // Farmer Question Bubble
                  <div className="max-w-md bg-emerald-900 text-white p-3.5 px-4 rounded-2xl rounded-tr-xs shadow-xs text-sm">
                    <p className="font-medium">{msg.text}</p>
                    <span className="block text-[10px] text-emerald-200/80 text-right mt-1">
                      {msg.time}
                    </span>
                  </div>
                ) : (
                  // AI Response Card
                  <Card className="max-w-2xl w-full p-4 sm:p-5 border border-emerald-200 bg-gradient-to-br from-white via-emerald-50/30 to-white rounded-2xl shadow-xs space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                          🌾
                        </div>
                        <span className="font-extrabold text-sm text-slate-900">
                          {t('voiceAssistant.aiResponseTitle')}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold bg-white border border-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                        {msg.responseMeta?.label || t('voiceAssistant.prototypeBadge')}
                      </span>
                    </div>

                    {/* Text Answer */}
                    <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                      {msg.text}
                    </p>

                    {/* Audio & Actions Bar */}
                    <div className="pt-2 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-2.5">
                      {/* Text-to-Speech Button */}
                      {ttsSupported && (
                        <button
                          type="button"
                          onClick={() => (isSpeakingTts && activeTtsId === msg.id ? stopTts() : playTts(msg.id, msg.text))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                            isSpeakingTts && activeTtsId === msg.id
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {isSpeakingTts && activeTtsId === msg.id ? (
                            <>
                              <Square className="w-3.5 h-3.5 text-amber-800 fill-current" />
                              <span>{t('voiceAssistant.stop')}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-emerald-800" />
                              <span>🔊 {t('voiceAssistant.listen')}</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Actionable button if AI suggested one */}
                      {msg.responseMeta?.suggestedAction && (
                        <button
                          type="button"
                          onClick={() => onNavigate(msg.responseMeta!.suggestedAction!.route)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors ml-auto"
                        >
                          {msg.responseMeta.suggestedAction.type === 'crop_recommendation' && <Sparkles className="w-3.5 h-3.5" />}
                          {msg.responseMeta.suggestedAction.type === 'buyer_matching' && <Users className="w-3.5 h-3.5" />}
                          {msg.responseMeta.suggestedAction.type === 'create_listing' && <Package className="w-3.5 h-3.5" />}
                          {msg.responseMeta.suggestedAction.type === 'demand_intelligence' && <TrendingUp className="w-3.5 h-3.5" />}
                          {msg.responseMeta.suggestedAction.type === 'price_intelligence' && <TrendingUp className="w-3.5 h-3.5" />}
                          {msg.responseMeta.suggestedAction.type === 'logistics' && <Truck className="w-3.5 h-3.5" />}
                          {msg.responseMeta.suggestedAction.type === 'emergency_recovery' && <AlertTriangle className="w-3.5 h-3.5" />}
                          <span>{msg.responseMeta.suggestedAction.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Disclaimer */}
                    <div className="text-[10px] text-slate-400 font-normal pt-1">
                      ℹ️ {t('voiceAssistant.disclaimer')}
                    </div>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
