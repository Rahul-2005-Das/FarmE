const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

export interface FarmerCopilotResponse {
  recommended_crops: { crop: string; score: number; reason: string }[];
  demand_outlook: string;
  price_outlook: string;
  risk: string;
  estimated_return?: string;
  buyer_opportunity?: string;
  reasoning: string;
  potential_buyer_categories: string[];
  logistics_considerations: string;
  next_action: string;
  mode: 'ai' | 'prototype';
  label: string;
}

export interface DemandForecastResponse {
  crop: string;
  demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  supplyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  supplyDemandGap: number;
  marketPressure: 'HIGH' | 'MEDIUM' | 'LOW';
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  explanation: string;
  mode: 'ai' | 'prototype';
  label: string;
}

async function requestJson<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

export function requestFarmerCopilot(input: {
  farmerId: string;
  farmerName: string;
  location: string;
  soilType: string;
  waterAvailability: string;
  landAreaAcres?: number;
  season?: string;
  preferredCrop?: string;
  language?: 'en' | 'bn' | 'hi';
}): Promise<FarmerCopilotResponse | null> {
  return requestJson<FarmerCopilotResponse>('/api/ai/farmer-copilot', input);
}

export interface AiChatResponse {
  answer: string;
  label: string;
  mode: 'ai' | 'prototype';
  suggestedAction?: {
    type: 'crop_recommendation' | 'buyer_matching' | 'create_listing' | 'demand_intelligence' | 'price_intelligence' | 'logistics' | 'emergency_recovery';
    label: string;
    route: string;
  };
}

export async function requestAiChat(
  message: string,
  context: Record<string, unknown>,
  language?: 'en' | 'bn' | 'hi'
): Promise<AiChatResponse | null> {
  const result = await requestJson<AiChatResponse>('/api/ai/chat', { message, context, language });
  if (result) return result;

  // Local deterministic fallback in case backend is offline or network fails
  const lang = language || (/[\u0980-\u09FF]/.test(message) ? 'bn' : /[\u0900-\u097F]/.test(message) ? 'hi' : 'en');
  const lower = message.toLowerCase();
  const location = typeof context.location === 'string' && context.location ? context.location : 'South 24 Parganas';

  if (lower.includes('চাষ') || lower.includes('ফসল') || lower.includes('grow') || lower.includes('crop') || lower.includes('उगा')) {
    return {
      answer: lang === 'bn'
        ? `আপনার ${location} অঞ্চলের মাটি ও জমির তথ্যের ভিত্তিতে টমেটো একটি লাভজনক ফসল হতে পারে। বর্তমান ডেমো ডেটায় চাহিদা সরবরাহের চেয়ে বেশি। এটি প্রোটোটাইপ বিশ্লেষণ।`
        : lang === 'hi'
        ? `आपके ${location} क्षेत्र और मिट्टी के अनुसार टमाटर एक उपयुक्त विकल्प है। प्रोटोटाइप डेटा में मांग आपूर्ति से अधिक है। यह प्रोटोटाइप विश्लेषण है।`
        : `Based on your ${location} land and soil profile, Tomato is a viable option with demand exceeding supply in prototype data.`,
      label: 'Prototype Intelligence / Offline Fallback',
      mode: 'prototype',
      suggestedAction: {
        type: 'crop_recommendation',
        label: lang === 'bn' ? 'ফসল সুপারিশ দেখুন' : lang === 'hi' ? 'फसल सिफारिश देखें' : 'View Crop Recommendation',
        route: 'farmer-crop-recommendation',
      },
    };
  }

  if (lower.includes('ক্রেতা') || lower.includes('কিনবে') || lower.includes('buyer') || lower.includes('खरीदार')) {
    return {
      answer: lang === 'bn'
        ? 'আপনার ফসলের জন্য প্রোটোটাইপ ডেটাতে যাচাইকৃত পাইকারি এবং খুচরা ক্রেতাদের সরাসরি মিল রয়েছে।'
        : lang === 'hi'
        ? 'आपके टमाटर के लिए सत्यापित थोक व खुदरा खरीदारों का सीधा मिलान मौजूद है।'
        : 'There are verified wholesale and retail buyers matched to your crop in prototype data.',
      label: 'Prototype Intelligence / Offline Fallback',
      mode: 'prototype',
      suggestedAction: {
        type: 'buyer_matching',
        label: lang === 'bn' ? 'মিলেছে এমন ক্রেতা দেখুন' : lang === 'hi' ? 'मिले हुए खरीदार देखें' : 'View Matched Buyers',
        route: 'farmer-matched-buyers',
      },
    };
  }

  return {
    answer: lang === 'bn'
      ? 'FarmE এআই প্রোটোটাইপ মোডে রয়েছে। আপনি ফসল নির্বাচন, বাজার চাহিদা, নির্দেশক মূল্য, ক্রেতা খোঁজা বা পরিবহন সম্পর্কে জিজ্ঞাসা করতে পারেন।'
      : lang === 'hi'
      ? 'FarmE एआई प्रोटोटाइप मोड में है। आप फसल, बाजार मांग, सांकेतिक मूल्य, खरीदार या परिवहन के बारे में पूछ सकते हैं।'
      : 'FarmE AI is operating in prototype intelligence mode. You can ask about crops, demand, prices, buyers, logistics, or emergency recovery.',
    label: 'Prototype Intelligence / Offline Fallback',
    mode: 'prototype',
  };
}

export function requestDemandForecast(input: { crop: string; location?: string; currentSupply?: number; currentDemand?: number; season?: string; historicalData?: unknown; language?: 'en' | 'bn' | 'hi' }): Promise<DemandForecastResponse | null> {
  return requestJson<DemandForecastResponse>('/api/ai/demand-forecast', input);
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
