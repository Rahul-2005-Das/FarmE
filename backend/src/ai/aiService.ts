import { z } from 'zod';
import { analyzeDemand } from '../../../src/services/demandEngine.ts';
import { analyzePrice } from '../../../src/services/priceEngine.ts';
import { getPrimaryCropRecommendation } from '../../../src/services/cropRecommendationEngine.ts';
import { matchBuyersForListing } from '../../../src/services/matchingEngine.ts';
import { DEMO_BUYER_REQUIREMENTS, DEMO_MARKET_REFERENCE } from '../../../src/data/mockData.ts';
import { TextJsonProvider } from './providers/textJsonProvider.js';
import type { AiProvider } from './providers/types.js';

const copilotSchema = z.object({
  recommended_crops: z.array(z.object({ crop: z.string(), score: z.number().min(0).max(100), reason: z.string() })).min(1),
  demand_outlook: z.string(),
  price_outlook: z.string(),
  risk: z.string(),
  estimated_return: z.string(),
  buyer_opportunity: z.string(),
  reasoning: z.string(),
  potential_buyer_categories: z.array(z.string()),
  logistics_considerations: z.string(),
  next_action: z.string(),
});

const demandForecastSchema = z.object({
  crop: z.string(),
  demandLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  supplyLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  supplyDemandGap: z.number(),
  marketPressure: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  risk: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  confidence: z.number().min(0).max(100),
  explanation: z.string(),
});

export type CopilotInput = {
  farmerId: string;
  farmerName: string;
  location: string;
  soilType: string;
  waterAvailability: string;
  landAreaAcres?: number;
  season?: string;
  preferredCrop?: string;
  language?: 'en' | 'bn' | 'hi';
};

export type CopilotResult = z.infer<typeof copilotSchema> & { mode: 'ai' | 'prototype'; label: string };
export type DemandForecastResult = z.infer<typeof demandForecastSchema> & { mode: 'ai' | 'prototype'; label: string };

function buildPrototypeResult(input: CopilotInput): CopilotResult {
  const recommendation = getPrimaryCropRecommendation(input.farmerName, input.location, input.farmerId, input.soilType, input.waterAvailability);
  const top = recommendation.opportunities.slice(0, 3);
  const demand = analyzeDemand({ crop: top[0]?.crop ?? 'Tomato', location: input.location });
  const price = analyzePrice({ crop: top[0]?.crop ?? 'Tomato', farmerExpectedPrice: top[0]?.expectedPrice.recommended ?? 31, marketReferenceRange: DEMO_MARKET_REFERENCE[top[0]?.crop ?? 'Tomato'] });
  const buyerCategories = matchBuyersForListing({ crop: top[0]?.crop ?? 'Tomato', quantity: 500, grade: 'Grade A', expectedPrice: price.recommendedMin, harvestDate: 'Within 4 days', location: { district: input.location, village: 'Demo village' } }, DEMO_BUYER_REQUIREMENTS).map((buyer) => buyer.buyerType);
  const language = input.language ?? 'en';
  const isBengali = language === 'bn';
  const isHindi = language === 'hi';
  return {
    recommended_crops: top.map((item) => ({ crop: item.crop, score: item.score, reason: item.reason })),
    demand_outlook: isBengali ? 'ডেমো ডেটায় চাহিদা বিশ্লেষণ সম্পন্ন।' : isHindi ? 'डेमो डेटा में मांग का विश्लेषण पूरा हुआ।' : `${demand.status === 'HIGH_DEMAND' ? 'High' : demand.status === 'SURPLUS' ? 'Surplus' : 'Balanced'} demand in illustrative application data.`,
    price_outlook: isBengali ? `নির্দেশক প্রোটোটাইপ দাম: ₹${price.recommendedMin}–₹${price.recommendedMax}/কেজি।` : isHindi ? `सांकेतिक प्रोटोटाइप मूल्य: ₹${price.recommendedMin}–₹${price.recommendedMax}/किग्रा।` : `Indicative prototype range: ₹${price.recommendedMin}–₹${price.recommendedMax}/kg.`,
    risk: isBengali ? 'মাঝারি' : isHindi ? 'मध्यम' : top[0]?.risk ?? 'Medium',
    estimated_return: isBengali ? `আনুমানিক আয়: ₹${top[0]?.estimatedReturn ?? 0}।` : isHindi ? `सांकेतिक आय: ₹${top[0]?.estimatedReturn ?? 0}।` : `Illustrative return: ₹${top[0]?.estimatedReturn ?? 0}.`,
    buyer_opportunity: buyerCategories.length ? (isBengali ? 'ডেমো ক্রেতার ডেটায় সুযোগ পাওয়া গেছে।' : isHindi ? 'डेमो खरीदार डेटा में अवसर उपलब्ध है।' : 'Available in existing demo buyer data.') : (isBengali ? 'তালিকা তৈরি করে ক্রেতা মিল দেখুন।' : isHindi ? 'सूची बनाकर खरीदार मिलान देखें।' : 'Review Buyer Matching after listing.'),
    reasoning: isBengali ? `${input.location}-এর জন্য প্রোটোটাইপ চাহিদা, দাম, ক্রেতা মিল এবং লজিস্টিকস ইঞ্জিন একসঙ্গে ব্যবহার করা হয়েছে। এটি লাইভ বাজার পূর্বাভাস নয়।` : isHindi ? `${input.location} के लिए प्रोटोटाइप मांग, मूल्य, खरीदार मिलान और लॉजिस्टिक्स इंजन का उपयोग किया गया है। यह लाइव बाजार पूर्वानुमान नहीं है।` : `Prototype recommendation combines the existing demand, price, buyer matching, and logistics engines for ${input.location}. It is not a live market forecast.`,
    potential_buyer_categories: [...new Set(buyerCategories)],
    logistics_considerations: top[0] ? `${top[0].farmToMarketOpportunity.route}; shared collection may save ₹${top[0].farmToMarketOpportunity.logisticsSavings}/kg in the demo scenario.` : 'Use the existing logistics planner after an order is created.',
    next_action: isBengali ? 'ক্রেতার মিল দেখুন, ফসলের তালিকা তৈরি করুন এবং অর্ডার ও লজিস্টিকস ধাপ এগিয়ে নিন।' : isHindi ? 'खरीदार मिलान देखें, फसल सूची बनाएं और ऑर्डर व लॉजिस्टिक्स प्रक्रिया आगे बढ़ाएं।' : 'Review buyer matches, create a produce listing, and continue through the existing order and logistics flow.',
    mode: 'prototype',
    label: 'Prototype Intelligence / Offline Fallback',
  };
}

function parseStructured(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseProviderResponse(value: unknown): CopilotResult | null {
  const parsed = copilotSchema.safeParse(parseStructured(value));
  return parsed.success ? { ...parsed.data, mode: 'ai', label: 'AI Mode' } : null;
}

function createProvider(): AiProvider | null {
  const provider = process.env.AI_PROVIDER;
  const url = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;
  if (!provider || !url || !apiKey) return null;
  if (provider === 'text-json' || provider === 'openai-compatible') {
    return new TextJsonProvider(url, apiKey, process.env.AI_MODEL);
  }
  return null;
}

export interface AiChatResult {
  answer: string;
  label: string;
  mode: 'ai' | 'prototype';
  suggestedAction?: {
    type: 'crop_recommendation' | 'buyer_matching' | 'create_listing' | 'demand_intelligence' | 'price_intelligence' | 'logistics' | 'emergency_recovery';
    label: string;
    route: string;
  };
}

const chatSchema = z.object({
  answer: z.string(),
  suggestedAction: z.object({
    type: z.enum(['crop_recommendation', 'buyer_matching', 'create_listing', 'demand_intelligence', 'price_intelligence', 'logistics', 'emergency_recovery']),
    label: z.string(),
    route: z.string(),
  }).optional(),
});

function detectLanguage(message: string, explicitLang?: 'en' | 'bn' | 'hi'): 'en' | 'bn' | 'hi' {
  if (explicitLang) return explicitLang;
  if (/[\u0980-\u09FF]/.test(message)) return 'bn';
  if (/[\u0900-\u097F]/.test(message)) return 'hi';
  return 'en';
}

function buildDeterministicChatResponse(message: string, context: Record<string, unknown>, lang: 'en' | 'bn' | 'hi'): AiChatResult {
  const text = message.toLowerCase();
  const location = typeof context.location === 'string' && context.location ? context.location : 'South 24 Parganas';
  const soil = typeof context.soilType === 'string' && context.soilType ? context.soilType : 'Loamy soil';
  const landArea = context.landAreaAcres ? `${context.landAreaAcres} acres` : '2 acres';

  // 1. What to grow / crop recommendation
  const isCropQuery = text.includes('চাষ') || text.includes('ফসল') || text.includes('কী করব') ||
    text.includes('उगा') || text.includes('फसल') || text.includes('क्या करें') ||
    text.includes('grow') || text.includes('crop') || text.includes('plant') || text.includes('recommend');

  if (isCropQuery) {
    if (lang === 'bn') {
      return {
        answer: `আপনার ${location} অঞ্চলের ${soil} ও আনুমানিক ${landArea} জমির তথ্য এবং বর্তমান প্রোটোটাইপ চাহিদা অনুযায়ী টমেটো ও আলু ভালো ফলন দিতে পারে। বর্তমান ডেমো ডেটায় টমেটোর চাহিদা সরবরাহের তুলনায় বেশি। এটি প্রোটোটাইপ বিশ্লেষণ, লাইভ বাজার পূর্বাভাস নয়।`,
        label: 'Prototype Intelligence / Offline Fallback',
        mode: 'prototype',
        suggestedAction: {
          type: 'crop_recommendation',
          label: 'ফসল সুপারিশ দেখুন',
          route: 'farmer-crop-recommendation',
        },
      };
    }
    if (lang === 'hi') {
      return {
        answer: `आपके ${location} क्षेत्र, ${soil} और लगभग ${landArea} भूमि के अनुसार टमाटर और आलू उपयुक्त फसलें हैं। वर्तमान प्रोटोटाइप डेटा में टमाटर की मांग आपूर्ति से अधिक है। यह प्रोटोटाइप विश्लेषण है, लाइव बाजार पूर्वानुमान नहीं।`,
        label: 'Prototype Intelligence / Offline Fallback',
        mode: 'prototype',
        suggestedAction: {
          type: 'crop_recommendation',
          label: 'फसल सिफारिश देखें',
          route: 'farmer-crop-recommendation',
        },
      };
    }
    return {
      answer: `Based on your ${location} location, ${soil}, and ${landArea} land profile in prototype data, Tomato is a strong option with demand exceeding supply. This is prototype intelligence, not a live market forecast.`,
      label: 'Prototype Intelligence / Offline Fallback',
      mode: 'prototype',
      suggestedAction: {
        type: 'crop_recommendation',
        label: 'View Crop Recommendation',
        route: 'farmer-crop-recommendation',
      },
    };
  }

  // 2. Demand query
  const isDemandQuery = text.includes('চাহিদা') || text.includes('demand') || text.includes('मांग') || text.includes('बाजार मांग');
  if (isDemandQuery) {
    if (lang === 'bn') {
      return {
        answer: `বর্তমান ডেমো বাজার ডেটায় টমেটোর চাহিদা উচ্চ (High Demand)। পাইকারি সংগ্রহ কেন্দ্রগুলোতে নিয়মিত ঘাটতি রয়েছে। এটি প্রোটোটাইপ বিশ্লেষণ।`,
        label: 'Prototype Intelligence / Offline Fallback',
        mode: 'prototype',
        suggestedAction: {
          type: 'demand_intelligence',
          label: 'চাহিদা পূর্বাভাস দেখুন',
          route: 'farmer-ai-copilot',
        },
      };
    }
    if (lang === 'hi') {
      return {
        answer: `वर्तमान प्रोटोटाइप बाजार डेटा में टमाटर की मांग उच्च (High Demand) है। थोक क्लस्टर में आपूर्ति से अधिक मांग दर्ज है। यह प्रोटोटाइप विश्लेषण है।`,
        label: 'Prototype Intelligence / Offline Fallback',
        mode: 'prototype',
        suggestedAction: {
          type: 'demand_intelligence',
          label: 'मांग पूर्वानुमान देखें',
          route: 'farmer-ai-copilot',
        },
      };
    }
    return {
      answer: `In illustrative prototype data, Tomato demand is HIGH with procurement demand exceeding local supply. This is prototype intelligence, not a live market forecast.`,
      label: 'Prototype Intelligence / Offline Fallback',
      mode: 'prototype',
      suggestedAction: {
        type: 'demand_intelligence',
        label: 'View Demand Forecast',
        route: 'farmer-ai-copilot',
      },
    };
  }

  // 3. Price query
  const isPriceQuery = text.includes('দাম') || text.includes('দর') || text.includes('টাকা') ||
    text.includes('मूल्य') || text.includes('भाव') || text.includes('दाम') || text.includes('रेट') ||
    text.includes('price') || text.includes('rate') || text.includes('return');
  if (isPriceQuery) {
    if (lang === 'bn') {
      return {
        answer: `প্রোটোটাইপ বাজার সূচক অনুযায়ী বর্তমান গ্রেড-এ টমেটোর নির্দেশক দাম ₹৩১–₹৩৬/কেজি। এটি ডেমো রেফারেন্স মূল্য, কোনো নিশ্চিত মুনাফার গ্যারান্টি নয়।`,
        label: 'Prototype Intelligence / Offline Fallback',
        mode: 'prototype',
        suggestedAction: {
          type: 'price_intelligence',
          label: 'বাজার দর বিশ্লেষণ দেখুন',
          route: 'farmer-ai-advisor',
        },
      };
    }
    if (lang === 'hi') {
      return {
        answer: `प्रोटोटाइप बाजार संदर्भ के अनुसार ग्रेड-ए टमाटर की सांकेतिक कीमत ₹31–₹36/किग्रा है। यह केवल प्रोटोटाइप विश्लेषण है, कोई गारंटीकृत लाभ नहीं है।`,
        label: 'Prototype Intelligence / Offline Fallback',
        mode: 'prototype',
        suggestedAction: {
          type: 'price_intelligence',
          label: 'मूल्य बुद्धिमत्ता देखें',
          route: 'farmer-ai-advisor',
        },
      };
    }
    return {
      answer: `Illustrative prototype market price reference for Grade A tomato is ₹31–₹36/kg. This is an indicative benchmark, not a price guarantee.`,
      label: 'Prototype Intelligence / Offline Fallback',
      mode: 'prototype',
      suggestedAction: {
        type: 'price_intelligence',
        label: 'View Price Intelligence',
        route: 'farmer-ai-advisor',
      },
    };
  }

  // 4. Buyer query / who will buy / why this buyer
  const isBuyerQuery = text.includes('ক্রেতা') || text.includes('কিনবে') || text.includes('কে কিনবে') ||
    text.includes('खरीदार') || text.includes('कौन खरीदेगा') || text.includes('ग्राहक') ||
    text.includes('buyer') || text.includes('who will buy') || text.includes('purchase') || text.includes('sell');
  if (isBuyerQuery) {
    const isWhyGood = text.includes('ভালো') || text.includes('কেন') || text.includes('अच्छा') || text.includes('क्यों') || text.includes('why') || text.includes('match');
    if (lang === 'bn') {
      return {
        answer: isWhyGood
          ? `এই ক্রেতা ম্যাচটিতে ফসলের গ্রেড (Grade A), কাছাকাছি দূরত্ব (${location} ক্লাস্টার) এবং ন্যায্য মূল্যের শতভাগ সামঞ্জস্য রয়েছে। আপনার তালিকা তৈরি করে ক্রেতা ম্যাচিং দেখতে পারেন।`
          : `আপনার বর্তমান ফসল তালিকার জন্য কলকাতার পাইকারি এবং খুচরা ক্রেতাদের সরাসরি প্রোটোটাইপ ম্যাচ উপলব্ধ রয়েছে। তালিকা তৈরি করুন বা ম্যাচ দেখুন।`,
        label: 'Prototype Intelligence / Offline Fallback',
        mode: 'prototype',
        suggestedAction: {
          type: 'buyer_matching',
          label: 'মিলেছে এমন ক্রেতা দেখুন',
          route: 'farmer-matched-buyers',
        },
      };
    }
    if (lang === 'hi') {
      return {
        answer: isWhyGood
          ? `इस खरीदार मैच में फसल ग्रेड (Grade A), उचित मूल्य और निकटतम दूरी का उच्च स्कोर है। आप अपनी लिस्टिंग बनाकर सटीक मिलान देख सकते हैं।`
          : `आपके टमाटर और आलू के लिए सत्यापित थोक व खुदरा खरीदार प्रोटोटाइप डेटा में मौजूद हैं। लिस्टिंग बनाएं या मिलान देखें।`,
        label: 'Prototype Intelligence / Offline Fallback',
        mode: 'prototype',
        suggestedAction: {
          type: 'buyer_matching',
          label: 'मिले हुए खरीदार देखें',
          route: 'farmer-matched-buyers',
        },
      };
    }
    return {
      answer: isWhyGood
        ? `This buyer is matched based on 92%+ fit in crop grade, volume requirement, fair price alignment, and proximity to your rural cluster.`
        : `Verified wholesale and retail buyers are available in the current prototype matching data for your harvest.`,
      label: 'Prototype Intelligence / Offline Fallback',
      mode: 'prototype',
      suggestedAction: {
        type: 'buyer_matching',
        label: 'View Matched Buyers',
        route: 'farmer-matched-buyers',
      },
    };
  }

  // 5. Transport / Logistics query
  const isTransportQuery = text.includes('পরিবহন') || text.includes('গাড়ি') || text.includes('খরচ') ||
    text.includes('परिवहन') || text.includes('लागत') || text.includes('गाड़ी') || text.includes('लॉजिस्टिक्स') ||
    text.includes('transport') || text.includes('logistics') || text.includes('delivery') || text.includes('vehicle');
  if (isTransportQuery) {
    if (lang === 'bn') {
      return {
        answer: `নিকটবর্তী কৃষকদের সাথে যৌথ সংগ্রহ পয়েন্টে ফসল একত্র করলে ছোট পিকআপের পরিবর্তে বড় যানে ৮০%+ ব্যবহার সম্ভব হয়, যা কেজিতে ₹১.৫০ থেকে ₹২.০০ পরিবহন খরচ বাঁচাতে পারে।`,
        label: 'Prototype Intelligence / Offline Fallback',
        mode: 'prototype',
        suggestedAction: {
          type: 'logistics',
          label: 'স্মার্ট ডেলিভারি ও লজিস্টিকস দেখুন',
          route: 'farmer-logistics',
        },
      };
    }
    if (lang === 'hi') {
      return {
        answer: `पास के किसानों के साथ साझा ग्रामीण संग्रह केंद्र पर फसल एकत्रित करने से वाहन क्षमता 80%+ तक उपयोग होती है, जिससे प्रति किलो ₹1.50–₹2.00 परिवहन बचत हो सकती है।`,
        label: 'Prototype Intelligence / Offline Fallback',
        mode: 'prototype',
        suggestedAction: {
          type: 'logistics',
          label: 'स्मार्ट लॉजिस्टिक्स देखें',
          route: 'farmer-logistics',
        },
      };
    }
    return {
      answer: `Grouping harvest at shared collection points achieves 80%+ vehicle utilization, potentially saving ₹1.50–₹2.00/kg in transport costs in this prototype routing model.`,
      label: 'Prototype Intelligence / Offline Fallback',
      mode: 'prototype',
      suggestedAction: {
        type: 'logistics',
        label: 'View Smart Logistics',
        route: 'farmer-logistics',
      },
    };
  }

  // 6. Cancellation / Emergency query
  const isCancelQuery = text.includes('বাতিল') || text.includes('নষ্ট') || text.includes('জরুরি') ||
    text.includes('रद्द') || text.includes('आपात') || text.includes('कैंसिल') ||
    text.includes('cancel') || text.includes('emergency') || text.includes('waste');
  if (isCancelQuery) {
    if (lang === 'bn') {
      return {
        answer: `যদি ক্রেতা শেষ মুহূর্তে অর্ডার বাতিল করে, তবে FarmE ইমার্জেন্সি রিকভারি ইঞ্জিন স্বয়ংক্রিয়ভাবে বিকল্প ক্রেতাদের শনাক্ত করে এবং ফসল নষ্ট হওয়া থেকে রক্ষা করতে দ্রুত উদ্ধার রুট তৈরি করে।`,
        label: 'Prototype Intelligence / Offline Fallback',
        mode: 'prototype',
        suggestedAction: {
          type: 'emergency_recovery',
          label: 'জরুরি বাজার পুনরুদ্ধার খুলুন',
          route: 'farmer-emergency',
        },
      };
    }
    if (lang === 'hi') {
      return {
        answer: `यदि खरीदार ऑर्डर रद्द करता है, तो इमरजेंसी मार्केट रिकवरी तुरंत वैकल्पिक खरीदारों को खोजती है और फसल नुकसान से बचाने के लिए रिकवरी रूट बनाती है।`,
        label: 'Prototype Intelligence / Offline Fallback',
        mode: 'prototype',
        suggestedAction: {
          type: 'emergency_recovery',
          label: 'आपातकालीन रिकवरी खोलें',
          route: 'farmer-emergency',
        },
      };
    }
    return {
      answer: `If a buyer cancels, FarmE's Emergency Market Recovery automatically matches alternative buyers to prevent harvest loss before freshness expires.`,
      label: 'Prototype Intelligence / Offline Fallback',
      mode: 'prototype',
      suggestedAction: {
        type: 'emergency_recovery',
        label: 'Open Emergency Recovery',
        route: 'farmer-emergency',
      },
    };
  }

  // General helpful response
  if (lang === 'bn') {
    return {
      answer: `আমি FarmE এআই। আপনি আমাকে ফসল নির্বাচন, বাজার চাহিদা, নির্দেশক মূল্য, ক্রেতা খোঁজা, পরিবহন খরচ কমানো অথবা বাতিল অর্ডারের জরুরি সমাধান নিয়ে প্রশ্ন করতে পারেন।`,
      label: 'Prototype Intelligence / Offline Fallback',
      mode: 'prototype',
      suggestedAction: {
        type: 'crop_recommendation',
        label: 'ফসল সুপারিশ দেখুন',
        route: 'farmer-crop-recommendation',
      },
    };
  }
  if (lang === 'hi') {
    return {
      answer: `मैं FarmE एआई हूँ। आप मुझसे फसल चयन, बाजार मांग, सांकेतिक मूल्य, खरीदार ढूंढने, परिवहन बचत या रद्द ऑर्डर रिकवरी के बारे में पूछ सकते हैं।`,
      label: 'Prototype Intelligence / Offline Fallback',
      mode: 'prototype',
      suggestedAction: {
        type: 'crop_recommendation',
        label: 'फसल सिफारिश देखें',
        route: 'farmer-crop-recommendation',
      },
    };
  }
  return {
    answer: `I am FarmE AI. I can assist you with what to grow, market demand, benchmark prices, finding verified buyers, reducing transport costs, or emergency recovery.`,
    label: 'Prototype Intelligence / Offline Fallback',
    mode: 'prototype',
    suggestedAction: {
      type: 'crop_recommendation',
      label: 'View Crop Recommendation',
      route: 'farmer-crop-recommendation',
    },
  };
}

export class AiService {
  private readonly provider: AiProvider | null;

  constructor(provider: AiProvider | null = createProvider()) {
    this.provider = provider;
  }

  async farmerCopilot(input: CopilotInput): Promise<CopilotResult> {
    const fallback = buildPrototypeResult(input);
    if (!this.provider) return fallback;
    const output = await this.provider.complete({
      system: `Return JSON only. Respond in ${input.language === 'bn' ? 'natural Bengali (বাংলা)' : input.language === 'hi' ? 'natural Hindi (हिन्दी)' : 'clear English'}. Do not switch to English unless explicitly requested. Use only supplied application context. Never invent live data, real buyers, weather, GPS, guaranteed profit, or government schemes.`,
      responseSchema: copilotSchema.shape,
      context: input,
    });
    return parseProviderResponse(output) ?? fallback;
  }

  async demandForecast(input: { crop: string; location?: string; supply?: number; demand?: number; season?: string; historicalData?: unknown; language?: 'en' | 'bn' | 'hi' }): Promise<DemandForecastResult> {
    const analysis = analyzeDemand({ crop: input.crop, location: input.location, currentSupply: input.supply, buyerDemand: input.demand });
    const fallback: DemandForecastResult = {
      crop: input.crop,
      demandLevel: analysis.status === 'HIGH_DEMAND' ? 'HIGH' : analysis.status === 'SURPLUS' ? 'LOW' : 'MEDIUM',
      supplyLevel: analysis.supply >= analysis.demand * 1.12 ? 'HIGH' : analysis.supply <= analysis.demand * 0.88 ? 'LOW' : 'MEDIUM',
      supplyDemandGap: analysis.gap,
      marketPressure: analysis.status === 'BALANCED' ? 'MEDIUM' : 'HIGH',
      risk: analysis.status === 'SURPLUS' ? 'HIGH' : analysis.status === 'HIGH_DEMAND' ? 'MEDIUM' : 'LOW',
      confidence: Math.round(analysis.confidence * 100),
      explanation: `${analysis.explanation} ${analysis.upcomingHarvestRisk}`,
      mode: 'prototype',
      label: 'Prototype Intelligence / Offline Fallback',
    };
    if (!this.provider) return fallback;
    const output = await this.provider.complete({
      system: `Return JSON only. Explain in ${input.language === 'bn' ? 'natural Bengali (বাংলা)' : input.language === 'hi' ? 'natural Hindi (हिन्दी)' : 'clear English'}. Forecast only from supplied application data. Do not claim live market data, weather, or guaranteed outcomes. Label reasoning as illustrative prototype intelligence.`,
      responseSchema: demandForecastSchema.shape,
      context: { ...input, suppliedAnalysis: analysis },
    });
    const parsed = demandForecastSchema.safeParse(parseStructured(output));
    return parsed.success ? { ...parsed.data, mode: 'ai', label: 'AI Mode' } : fallback;
  }

  priceIntelligence(input: { crop: string; farmerExpectedPrice: number; buyerOffers?: number[] }) {
    const result = analyzePrice({ crop: input.crop, farmerExpectedPrice: input.farmerExpectedPrice, buyerOffers: input.buyerOffers });
    return {
      indicativePriceRange: { min: result.recommendedMin, max: result.recommendedMax },
      pricePressure: result.pricePosition === 'above_market' ? 'Downward negotiation pressure' : result.pricePosition === 'below_market' ? 'Room to negotiate upward' : 'Within indicative range',
      negotiationRange: { min: result.marketMin, max: result.bestOffer },
      explanation: result.explanation,
      mode: 'prototype' as const,
      label: 'Prototype Intelligence / Offline Fallback',
    };
  }

  buyerExplanation(input: { crop: string; buyerId?: string; location?: string; expectedPrice?: number }) {
    const buyer = matchBuyersForListing({ crop: input.crop, quantity: 500, grade: 'Grade A', expectedPrice: input.expectedPrice ?? 31, harvestDate: 'Within 4 days', location: { district: input.location ?? 'South 24 Parganas', village: 'Demo village' } }, DEMO_BUYER_REQUIREMENTS).find((item) => !input.buyerId || item.buyerId === input.buyerId);
    if (!buyer) return { matchScore: 0, reasons: ['No matching demo buyer was found for the supplied crop.'], mode: 'prototype' as const, label: 'Prototype Intelligence / Offline Fallback' };
    return { matchScore: buyer.score, reasons: [`Crop match: ${buyer.breakdown.crop}%`, `Quantity fit: ${buyer.breakdown.quantity}%`, `Quality fit: ${buyer.breakdown.quality}%`, `Distance fit: ${buyer.breakdown.distance}%`, `Timing fit: ${buyer.breakdown.timing}%`, `Price fit: ${buyer.breakdown.price}%`], mode: 'prototype' as const, label: 'Prototype Intelligence / Offline Fallback' };
  }

  async chat(message: string, context: Record<string, unknown>, explicitLang?: 'en' | 'bn' | 'hi'): Promise<AiChatResult> {
    const lang = detectLanguage(message, explicitLang);
    const fallback = buildDeterministicChatResponse(message, context, lang);
    if (!this.provider) return fallback;

    try {
      const languageInstruction = lang === 'bn' ? 'Respond in Bengali (বাংলা).' : lang === 'hi' ? 'Respond in Hindi (हिंदी).' : 'Respond in English.';
      const output = await this.provider.complete({
        system: `You are FarmE AI, a rural farm-to-market assistant for Indian farmers. ${languageInstruction} Keep answers short (2-3 sentences), simple, actionable, and friendly. Never invent live market prices, live weather, real GPS, guaranteed profit, or government schemes. Explicitly reference prototype intelligence when providing market or price figures. Return JSON matching schema.`,
        responseSchema: chatSchema.shape,
        context: { message, context, detectedLanguage: lang },
      });
      const parsed = chatSchema.safeParse(parseStructured(output));
      if (parsed.success) {
        return {
          answer: parsed.data.answer,
          suggestedAction: parsed.data.suggestedAction ?? fallback.suggestedAction,
          label: 'AI Mode',
          mode: 'ai',
        };
      }
    } catch {
      // Gracefully fall back to deterministic response on any provider error
    }
    return fallback;
  }
}

