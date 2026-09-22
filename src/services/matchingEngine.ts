import { DEMO_BUYER_REQUIREMENTS, DEMO_MARKET_REFERENCE } from '../data/mockData';
import {
  BuyerMatchResult,
  BuyerRequirement,
  FarmerProduceListing,
  MatchBreakdown,
  MatchLevel,
  ProduceGrade,
} from '../types';

const WEIGHTS = {
  crop: 0.25,
  quantity: 0.15,
  quality: 0.15,
  price: 0.15,
  distance: 0.15,
  timing: 0.15,
};

/** Demo proximity scores between farmer district and buyer district (0–100). */
const DISTANCE_SCORE: Record<string, Record<string, number>> = {
  'south 24 parganas': {
    kolkata: 95,
    'north 24 parganas': 88,
    howrah: 78,
    hooghly: 72,
  },
  kolkata: {
    kolkata: 100,
    'north 24 parganas': 90,
    howrah: 92,
    'south 24 parganas': 95,
  },
  hooghly: {
    howrah: 90,
    kolkata: 85,
    'north 24 parganas': 75,
  },
};

const GRADE_RANK: Record<string, number> = {
  'Grade A': 3,
  'Export Quality': 4,
  'Grade B': 2,
  'Grade C': 1,
  'Not sure': 1,
};

function normalizeCrop(crop: string): string {
  return crop.trim().toLowerCase().replace(/\(.*?\)/g, '').trim();
}

function scoreCrop(farmerCrop: string, buyerCrop: string): number {
  const a = normalizeCrop(farmerCrop);
  const b = normalizeCrop(buyerCrop);
  if (a === b) return 100;
  if (a.includes(b) || b.includes(a)) return 85;
  return 15;
}

function scoreQuantity(farmerQty: number, requiredQty: number): number {
  if (!farmerQty || !requiredQty) return 40;
  const ratio = farmerQty / requiredQty;
  // Cannot fully fill large institutional orders
  if (ratio < 1) {
    return Math.max(45, Math.round(ratio * 100));
  }
  if (ratio <= 1.3) return 100;
  if (ratio <= 1.6) return 90;
  if (ratio <= 2.2) return 80;
  if (ratio <= 2.8) return 70;
  return 55;
}

function scoreQuality(farmerGrade: ProduceGrade | string, minQuality: string): number {
  const f = GRADE_RANK[farmerGrade] ?? 1;
  const m = GRADE_RANK[minQuality] ?? 2;
  if (f > m) return 90;
  if (f === m) return 95;
  if (f === m - 1) return 62;
  return 38;
}

function scorePrice(farmerExpected: number, offer: number, crop: string): number {
  const ref = DEMO_MARKET_REFERENCE[crop] || DEMO_MARKET_REFERENCE.Tomato;
  const mid = (ref.min + ref.max) / 2;
  const offerVsMarket = 100 - Math.min(40, Math.abs(offer - mid) * 8);
  const gapToFarmer = Math.abs(farmerExpected - offer);
  const expectationPenalty = Math.min(28, gapToFarmer * 4.5);
  // Slight boost for offers inside illustrative market band
  const bandBonus = offer >= ref.min && offer <= ref.max ? 8 : 0;
  return Math.max(35, Math.round(offerVsMarket - expectationPenalty + bandBonus + 5));
}

function scoreDistance(farmerDistrict: string, buyerDistrict: string): number {
  const f = farmerDistrict.trim().toLowerCase();
  const b = buyerDistrict.trim().toLowerCase();
  if (f === b) return 100;
  return DISTANCE_SCORE[f]?.[b] ?? DISTANCE_SCORE[b]?.[f] ?? 62;
}

function parseHarvestDays(harvestDate?: string): number {
  if (!harvestDate) return 4;
  const lower = harvestDate.toLowerCase();
  if (lower.includes('today') || lower.includes('আজ') || lower.includes('ready')) return 0;
  if (lower.includes('tomorrow') || lower.includes('কাল')) return 1;
  const match = harvestDate.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  return 4;
}

function scoreTiming(harvestDate: string | undefined, deadlineDays: number): number {
  const harvestIn = parseHarvestDays(harvestDate);
  if (deadlineDays <= 0) return 50;
  if (harvestIn <= deadlineDays) {
    const slack = deadlineDays - harvestIn;
    return Math.min(100, 82 + slack * 4);
  }
  const late = harvestIn - deadlineDays;
  return Math.max(35, 68 - late * 12);
}

function toMatchLevel(score: number): MatchLevel {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Good';
  return 'Fair';
}

function weightedScore(b: MatchBreakdown): number {
  return Math.round(
    b.crop * WEIGHTS.crop +
      b.quantity * WEIGHTS.quantity +
      b.quality * WEIGHTS.quality +
      b.price * WEIGHTS.price +
      b.distance * WEIGHTS.distance +
      b.timing * WEIGHTS.timing
  );
}

export function matchBuyerToListing(
  listing: Pick<
    FarmerProduceListing,
    'crop' | 'quantity' | 'grade' | 'expectedPrice' | 'harvestDate' | 'location'
  >,
  requirement: BuyerRequirement
): BuyerMatchResult {
  const breakdown: MatchBreakdown = {
    crop: scoreCrop(listing.crop, requirement.crop),
    quantity: scoreQuantity(listing.quantity, requirement.requiredQuantityKg),
    quality: scoreQuality(listing.grade, requirement.minimumQuality),
    price: scorePrice(listing.expectedPrice, requirement.offeredPricePerKg, listing.crop),
    distance: scoreDistance(listing.location.district, requirement.district),
    timing: scoreTiming(listing.harvestDate, requirement.deliveryDeadlineDays),
  };

  const score = weightedScore(breakdown);
  const matchLevel = toMatchLevel(score);

  const explanation = `Prototype match: crop ${breakdown.crop}%, quantity ${breakdown.quantity}%, quality ${breakdown.quality}%, price ${breakdown.price}%, distance ${breakdown.distance}%, timing ${breakdown.timing}%.`;

  return {
    buyerId: requirement.buyerId,
    buyerName: requirement.businessName,
    buyerType: requirement.buyerType,
    requiredQuantityKg: requirement.requiredQuantityKg,
    offeredPricePerKg: requirement.offeredPricePerKg,
    district: requirement.district,
    deliveryDeadlineDays: requirement.deliveryDeadlineDays,
    score,
    matchLevel,
    breakdown,
    explanation,
    recommended: score >= 85,
  };
}

export function matchBuyersForListing(
  listing: Pick<
    FarmerProduceListing,
    'crop' | 'quantity' | 'grade' | 'expectedPrice' | 'harvestDate' | 'location'
  >,
  requirements: BuyerRequirement[] = DEMO_BUYER_REQUIREMENTS
): BuyerMatchResult[] {
  const cropKey = normalizeCrop(listing.crop);
  const relevant = requirements.filter((r) => normalizeCrop(r.crop) === cropKey);
  const pool = relevant.length > 0 ? relevant : requirements.slice(0, 3);

  return pool
    .map((r) => matchBuyerToListing(listing, r))
    .sort((a, b) => b.score - a.score);
}

/** Reverse match: how suitable a farmer listing is for a buyer's requirement. */
export function matchListingForBuyer(
  listing: Pick<
    FarmerProduceListing,
    'crop' | 'quantity' | 'grade' | 'expectedPrice' | 'harvestDate' | 'location' | 'id' | 'farmerName'
  >,
  requirement: BuyerRequirement
): BuyerMatchResult & { listingId?: string; farmerName?: string } {
  const base = matchBuyerToListing(listing, requirement);
  return {
    ...base,
    listingId: (listing as { id?: string }).id,
    farmerName: (listing as { farmerName?: string }).farmerName,
  };
}
