import { DEMO_MARKET_REFERENCE } from '../data/mockData';
import { PriceIntelligence } from '../types';

export function analyzePrice(input: {
  crop: string;
  farmerExpectedPrice: number;
  buyerOffers?: number[];
  marketReferenceRange?: { min: number; max: number };
}): PriceIntelligence {
  const crop = input.crop || 'Tomato';
  const ref =
    input.marketReferenceRange ||
    DEMO_MARKET_REFERENCE[crop] ||
    DEMO_MARKET_REFERENCE.Tomato ||
    { min: 25, max: 35 };

  const offers =
    input.buyerOffers && input.buyerOffers.length > 0
      ? [...input.buyerOffers].sort((a, b) => b - a)
      : [31, 30, 29];

  const bestOffer = offers[0];
  const farmerExpected = input.farmerExpectedPrice || ref.max;

  // Prototype recommendation: slightly above market mid when demand is strong,
  // but below farmer's often optimistic ask when ask is above market max.
  const mid = (ref.min + ref.max) / 2;
  let recommendedMin = Math.round(mid);
  let recommendedMax = Math.round(ref.max + 1);

  if (farmerExpected > ref.max + 2) {
    recommendedMin = ref.min + 2;
    recommendedMax = ref.max + 1;
  } else if (farmerExpected < ref.min) {
    recommendedMin = farmerExpected;
    recommendedMax = ref.max;
  }

  let pricePosition: PriceIntelligence['pricePosition'] = 'within_market';
  if (farmerExpected > ref.max) pricePosition = 'above_market';
  else if (farmerExpected < ref.min) pricePosition = 'below_market';

  let explanation = '';
  if (pricePosition === 'above_market') {
    explanation = `Your expected price (₹${farmerExpected}/kg) is above the current illustrative market range (₹${ref.min}–₹${ref.max}/kg). Offers from ₹${Math.min(...offers)}–₹${bestOffer}/kg are closer to the reference range.`;
  } else if (pricePosition === 'below_market') {
    explanation = `Your expected price (₹${farmerExpected}/kg) is below the illustrative market range (₹${ref.min}–₹${ref.max}/kg). You may have room to negotiate upward.`;
  } else {
    explanation = `Your expected price (₹${farmerExpected}/kg) is within the illustrative market range (₹${ref.min}–₹${ref.max}/kg). Prototype AI suggested band: ₹${recommendedMin}–₹${recommendedMax}/kg.`;
  }

  return {
    crop,
    marketMin: ref.min,
    marketMax: ref.max,
    farmerExpected,
    bestOffer,
    recommendedMin,
    recommendedMax,
    pricePosition,
    explanation,
    buyerOffers: offers,
  };
}
