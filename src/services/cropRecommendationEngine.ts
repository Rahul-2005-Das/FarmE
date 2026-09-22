import {
  DEMO_BUYER_REQUIREMENTS,
  DEMO_MARKET_REFERENCE,
} from '../data/mockData';
import {
  CropRecommendationOpportunity,
  CropRecommendationResult,
  CropRecommendationBuyer,
} from '../types';
import { analyzeDemand } from './demandEngine';
import { matchBuyersForListing } from './matchingEngine';
import { analyzePrice } from './priceEngine';

const baseOpportunityMap: Record<string, { market: string; district: string; route: string; collectionPoint: string; logisticsSavings: number }> = {
  Tomato: {
    market: 'Posta Bazar, Kolkata',
    district: 'Kolkata',
    route: 'Champahati → Posta Bazar',
    collectionPoint: 'Champahati Rail Crossing Market',
    logisticsSavings: 1.5,
  },
  Potato: {
    market: 'Sheoraphuli Mandi',
    district: 'Hooghly',
    route: 'Baruipur → Sheoraphuli Mandi',
    collectionPoint: 'Baruipur FPO Aggregation Point',
    logisticsSavings: 1.2,
  },
  Brinjal: {
    market: 'Salt Lake Sector V Hub',
    district: 'North 24 Parganas',
    route: 'Champahati → Salt Lake Hub',
    collectionPoint: 'Bishnupur Village Collection Point',
    logisticsSavings: 1.3,
  },
  Onion: {
    market: 'Koley Market, Kolkata',
    district: 'Kolkata',
    route: 'Baruipur → Koley Market',
    collectionPoint: 'Baruipur Market Yard',
    logisticsSavings: 1.4,
  },
};

function normalizeCropName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return 'Tomato';
  const lower = trimmed.toLowerCase();
  if (lower.includes('potato')) return 'Potato';
  if (lower.includes('onion')) return 'Onion';
  if (lower.includes('brinjal') || lower.includes('eggplant')) return 'Brinjal';
  return 'Tomato';
}

function getBuyerMatches(crop: string, district: string, expectedPrice: number): CropRecommendationBuyer[] {
  return matchBuyersForListing({
    crop,
    quantity: 500,
    grade: 'Grade A',
    expectedPrice,
    harvestDate: 'Within 4 days',
    location: { district, village: 'Champahati' },
  }, DEMO_BUYER_REQUIREMENTS)
    .filter((match) => match.breakdown.crop >= 85)
    .map((match) => ({
      buyerName: match.buyerName,
      buyerType: match.buyerType,
      offeredPricePerKg: match.offeredPricePerKg,
      requiredQuantityKg: match.requiredQuantityKg,
      district: match.district,
    }));
}

export function generateCropRecommendations(farmerName = 'Ramesh Mondal', district = 'South 24 Parganas'): CropRecommendationResult {
  const orderedCrops = ['Tomato', 'Brinjal', 'Potato', 'Onion'];
  const opportunities: CropRecommendationOpportunity[] = orderedCrops.map((crop, index) => {
    const base = baseOpportunityMap[crop] ?? baseOpportunityMap.Tomato;
    const demand = analyzeDemand({
      crop,
      expectedSupply: 1500 + index * 450,
      buyerDemand: 2200 + index * 420,
      location: district,
    });
    const price = analyzePrice({
      crop,
      farmerExpectedPrice: 32 + index * 2,
      buyerOffers: [29, 30, 31, 32],
      marketReferenceRange: DEMO_MARKET_REFERENCE[crop] || { min: 26, max: 32 },
    });

    const buyerMatches = getBuyerMatches(crop, district, price.recommendedMin);
    const score = Math.min(99, Math.max(68, Math.round((demand.demandScore + (buyerMatches.length * 10) + (price.bestOffer * 1.5)) / 1.7)));

    return {
      crop,
      market: base.market,
      district: base.district,
      demandStatus: demand.status === 'HIGH_DEMAND' ? 'High demand' : demand.status === 'SURPLUS' ? 'Surplus' : 'Balanced',
      buyerMatches,
      expectedPrice: {
        min: price.marketMin,
        max: price.marketMax,
        recommended: price.recommendedMin,
      },
      farmToMarketOpportunity: {
        route: base.route,
        logisticsSavings: base.logisticsSavings,
        collectionPoint: base.collectionPoint,
        expectedMargin: Math.max(600, Math.round((price.recommendedMin - price.marketMin) * 220)),
      },
      risk: crop === 'Potato' ? 'Medium' : 'Low',
      estimatedReturn: Math.max(12000, Math.round(price.recommendedMin * 500)),
      score,
      reason: demand.explanation,
    };
  });

  const sorted = opportunities.sort((a, b) => b.score - a.score);
  const topCrop = sorted[0];
  const summary = `${farmerName} can prioritize ${topCrop.crop} in ${district} because the prototype demand signal is strongest, buyer interest is active, and the route to ${topCrop.market} is efficient for direct farm-to-market selling.`;

  return {
    farmerId: 'f-101',
    farmerName,
    district,
    soil: 'Loamy soil',
    waterAvailability: 'Moderate water',
    generatedAt: new Date().toISOString(),
    summary,
    opportunities: sorted,
  };
}

export function getPrimaryCropRecommendation(
  farmerName?: string,
  district?: string,
  farmerId = 'f-101',
  soil = 'Loamy soil',
  waterAvailability = 'Moderate water'
): CropRecommendationResult {
  const profileName = farmerName || 'Ramesh Mondal';
  const profileDistrict = district || 'South 24 Parganas';
  const result = generateCropRecommendations(profileName, profileDistrict);
  return { ...result, farmerId, soil, waterAvailability };
}

export function getRecommendedCropNames(): string[] {
  return ['Tomato', 'Brinjal', 'Potato', 'Onion'];
}

export function getCropRecommendationSeed(crop?: string): string {
  return normalizeCropName(crop || 'Tomato');
}
