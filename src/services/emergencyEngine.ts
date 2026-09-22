import { AlternativeBuyer, EmergencyCase, EmergencyUrgency, FreshnessRisk, Order, RecoveryAllocation } from '../types';

export const DEMO_ALTERNATIVE_BUYERS = [
  { id: 'em-b1', name: 'Kolkata Fresh Mart', location: 'Kolkata', requiredQuantityKg: 250, offerPerKg: 32, distanceKm: 28, urgency: 'High' as const, reliability: 92 },
  { id: 'em-b2', name: 'Baruipur Wholesale Hub', location: 'Baruipur', requiredQuantityKg: 180, offerPerKg: 31, distanceKm: 12, urgency: 'High' as const, reliability: 88 },
  { id: 'em-b3', name: 'South Bengal Retail Network', location: 'Garia', requiredQuantityKg: 150, offerPerKg: 30, distanceKm: 22, urgency: 'Medium' as const, reliability: 84 },
  { id: 'em-b4', name: 'Fresh Basket Cooperative', location: 'Sonarpur', requiredQuantityKg: 120, offerPerKg: 29, distanceKm: 8, urgency: 'Medium' as const, reliability: 80 },
];

export function calculateFreshnessRisk(daysRemaining: number): FreshnessRisk {
  if (daysRemaining <= 0) return 'CRITICAL';
  if (daysRemaining <= 2) return 'HIGH';
  if (daysRemaining <= 5) return 'MEDIUM';
  return 'LOW';
}

export function calculateUrgencyScore(input: { buyerCancelled: boolean; unsoldQuantityKg: number; totalQuantityKg: number; freshnessDaysRemaining: number }): number {
  const cancellation = input.buyerCancelled ? 30 : 0;
  const quantity = input.totalQuantityKg > 0 ? Math.round((input.unsoldQuantityKg / input.totalQuantityKg) * 20) : 0;
  const freshness = Math.max(0, Math.min(20, 20 - input.freshnessDaysRemaining * 2));
  const demand = 15;
  const buyerAvailability = 13;
  return Math.min(100, cancellation + quantity + freshness + demand + buyerAvailability);
}

export function getUrgencyLevel(score: number): EmergencyUrgency {
  if (score >= 90) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 45) return 'MEDIUM';
  return 'LOW';
}

export function calculateRecoveryScore(input: { capacityFit: number; priceFit: number; distanceFit: number; urgencyFit: number; reliability: number; freshnessFit: number }): number {
  return Math.round(input.capacityFit * 0.25 + input.priceFit * 0.2 + input.distanceFit * 0.2 + input.urgencyFit * 0.15 + input.reliability * 0.1 + input.freshnessFit * 0.1);
}

export function rankAlternativeBuyers(emergencyQuantityKg: number, marketMin = 29, marketMax = 32): AlternativeBuyer[] {
  return DEMO_ALTERNATIVE_BUYERS.map((buyer) => {
    const capacityFit = Math.min(100, Math.round((buyer.requiredQuantityKg / Math.max(emergencyQuantityKg, 1)) * 100));
    const priceFit = Math.round(((buyer.offerPerKg - marketMin) / Math.max(marketMax - marketMin, 1)) * 100);
    const distanceFit = Math.max(35, 100 - buyer.distanceKm * 2);
    const urgencyFit = buyer.urgency === 'High' ? 100 : 75;
    const freshnessFit = buyer.urgency === 'High' ? 100 : 80;
    return { ...buyer, matchScore: calculateRecoveryScore({ capacityFit, priceFit, distanceFit, urgencyFit, reliability: buyer.reliability, freshnessFit }), capacityFit, priceFit, distanceFit, urgencyFit, freshnessFit };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export function calculateRecoveryPrice(marketMin: number, marketMax: number, buyers: AlternativeBuyer[]): { min: number; max: number } {
  const offers = buyers.map((buyer) => buyer.offerPerKg);
  return { min: Math.max(marketMin, Math.min(...offers)), max: Math.min(marketMax, Math.max(...offers)) };
}

export function allocateEmergencyQuantity(quantityKg: number, buyers: AlternativeBuyer[]): RecoveryAllocation[] {
  let remaining = quantityKg;
  return buyers.slice(0, 2).flatMap((buyer) => {
    const quantity = Math.min(remaining, buyer.requiredQuantityKg);
    remaining -= quantity;
    return quantity > 0 ? [{ buyerId: buyer.id, buyerName: buyer.name, quantityKg: quantity, pricePerKg: buyer.offerPerKg, totalValue: quantity * buyer.offerPerKg }] : [];
  });
}

export function generateRecoveryRecommendation(emergencyCase: EmergencyCase): string {
  const first = emergencyCase.alternativeBuyers[0];
  const second = emergencyCase.alternativeBuyers[1];
  return `Split ${emergencyCase.emergencyQuantityKg} kg between ${first?.name ?? 'available buyers'}${second ? ` and ${second.name}` : ''} at an illustrative recovery price of ₹${emergencyCase.marketMin}–₹${emergencyCase.marketMax}/kg.`;
}

export function calculateFarmerRecoveryImpact(emergencyCase: EmergencyCase) {
  const recovered = emergencyCase.allocations.reduce((total, allocation) => total + allocation.quantityKg, 0);
  const recoveryValue = emergencyCase.allocations.reduce((total, allocation) => total + allocation.totalValue, 0);
  return { recoveredQuantityKg: recovered, remainingQuantityKg: Math.max(0, emergencyCase.emergencyQuantityKg - recovered), recoveryValue, savedFromLossKg: recovered };
}

export function generateEmergencyMarketPlan(): EmergencyCase {
  const emergencyQuantityKg = 300;
  const buyers = rankAlternativeBuyers(emergencyQuantityKg);
  const riskScore = calculateUrgencyScore({ buyerCancelled: true, unsoldQuantityKg: emergencyQuantityKg, totalQuantityKg: 500, freshnessDaysRemaining: 2 });
  return {
    id: 'EM-DEMO-001', farmerName: 'Ramesh Mondal', farmerId: 'f-101', location: 'South 24 Parganas', crop: 'Tomato', totalQuantityKg: 500, originalBuyerAllocationKg: 300, confirmedQuantityKg: 200, emergencyQuantityKg, quality: 'Grade A', harvestWindowDays: 4, freshnessDaysRemaining: 2, originalExpectedPrice: 35, marketMin: 29, marketMax: 32, buyerCancelled: false, urgency: getUrgencyLevel(riskScore), riskScore, freshnessRisk: calculateFreshnessRisk(2), status: 'Detected', alternativeBuyers: buyers, allocations: [], createdAt: new Date().toISOString(),
  };
}

export function generateEmergencyMarketPlanForOrder(order: Order): EmergencyCase {
  const quantityAtRisk = Math.max(1, Math.min(order.quantityKg, Math.round(order.quantityKg * 0.6)));
  const base = generateEmergencyMarketPlan();
  const riskScore = calculateUrgencyScore({ buyerCancelled: true, unsoldQuantityKg: quantityAtRisk, totalQuantityKg: order.quantityKg, freshnessDaysRemaining: 2 });
  return {
    ...base,
    id: `EM-${order.id}`,
    farmerName: order.farmerName,
    farmerId: order.farmerId,
    location: order.pickupLocation,
    crop: order.cropNameEn,
    totalQuantityKg: order.quantityKg,
    originalBuyerAllocationKg: quantityAtRisk,
    confirmedQuantityKg: order.quantityKg - quantityAtRisk,
    emergencyQuantityKg: quantityAtRisk,
    originalExpectedPrice: order.agreedPricePerKg,
    riskScore,
    urgency: getUrgencyLevel(riskScore),
    alternativeBuyers: [],
    orderId: order.id,
  };
}

export function simulateCancellation(emergencyCase: EmergencyCase): EmergencyCase {
  const riskScore = calculateUrgencyScore({
    buyerCancelled: true,
    unsoldQuantityKg: emergencyCase.emergencyQuantityKg,
    totalQuantityKg: emergencyCase.totalQuantityKg,
    freshnessDaysRemaining: emergencyCase.freshnessDaysRemaining,
  });
  return { ...emergencyCase, buyerCancelled: true, riskScore, urgency: getUrgencyLevel(riskScore), status: 'Searching' };
}

export function generateRecoveryPlan(emergencyCase: EmergencyCase): EmergencyCase {
  return { ...emergencyCase, allocations: allocateEmergencyQuantity(emergencyCase.emergencyQuantityKg, emergencyCase.alternativeBuyers), status: 'Matched' };
}
