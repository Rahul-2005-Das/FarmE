import { DEMO_SUPPLY_DEMAND } from '../data/mockData';
import { DemandAnalysis, DemandStatus, SupplyDemandSnapshot } from '../types';

export function calculateSupplyDemandGap(supply: number, demand: number): number {
  return Math.round(demand - supply);
}

export function calculateDemandStatus(supply: number, demand: number): DemandStatus {
  if (supply <= 0 && demand <= 0) return 'BALANCED';
  const ratio = demand / Math.max(supply, 1);
  if (ratio >= 1.12) return 'HIGH_DEMAND';
  if (ratio <= 0.88) return 'SURPLUS';
  return 'BALANCED';
}

export function calculateUpcomingHarvestRisk(
  snapshot: SupplyDemandSnapshot | undefined,
  status: DemandStatus
): string {
  if (!snapshot) {
    return 'Insufficient demo data to estimate upcoming harvest risk.';
  }
  const upcoming = snapshot.upcomingHarvestKg ?? 0;
  const farmers = snapshot.farmersHarvestingSoon ?? 0;

  if (status === 'SURPLUS' || upcoming > snapshot.demandKg * 0.25) {
    return `${farmers} farmers are expected to harvest ~${upcoming} kg of ${snapshot.crop} within the next 5 days. Potential surplus risk if buyer coordination is delayed.`;
  }
  if (status === 'HIGH_DEMAND') {
    return `${farmers} farmers harvesting soon (~${upcoming} kg). Demand still exceeds supply — potential shortage if matching is delayed.`;
  }
  return `${farmers} farmers expected to harvest ~${upcoming} kg soon. Market currently balanced — monitor closely.`;
}

export function getCropSnapshot(crop: string): SupplyDemandSnapshot | undefined {
  const key = crop.trim().toLowerCase();
  return DEMO_SUPPLY_DEMAND.find((s) => s.crop.toLowerCase() === key);
}

export function analyzeDemand(input: {
  crop: string;
  currentSupply?: number;
  expectedSupply?: number;
  buyerDemand?: number;
  harvestDate?: string;
  location?: string;
}): DemandAnalysis {
  const snapshot = getCropSnapshot(input.crop);
  const supply =
    input.currentSupply ??
    input.expectedSupply ??
    snapshot?.supplyKg ??
    1000;
  const demand = input.buyerDemand ?? snapshot?.demandKg ?? 1000;
  const gap = calculateSupplyDemandGap(supply, demand);
  const status = calculateDemandStatus(supply, demand);

  const demandScore =
    status === 'HIGH_DEMAND'
      ? Math.min(98, 70 + Math.round((gap / Math.max(demand, 1)) * 100))
      : status === 'SURPLUS'
      ? Math.max(20, 55 - Math.round((Math.abs(gap) / Math.max(supply, 1)) * 80))
      : 55;

  const confidence = snapshot ? 0.82 : 0.55;

  let explanation = '';
  if (status === 'HIGH_DEMAND') {
    explanation = `Illustrative demo: estimated demand (${demand} kg) exceeds supply (${supply} kg) by ${gap} kg. High demand opportunity for ${input.crop}.`;
  } else if (status === 'SURPLUS') {
    explanation = `Illustrative demo: supply (${supply} kg) exceeds demand (${demand} kg) by ${Math.abs(gap)} kg. Surplus pressure on ${input.crop} prices.`;
  } else {
    explanation = `Illustrative demo: supply (${supply} kg) and demand (${demand} kg) are roughly balanced for ${input.crop}.`;
  }

  return {
    crop: input.crop || 'Unknown',
    supply,
    demand,
    gap,
    status,
    demandScore,
    confidence,
    explanation,
    upcomingHarvestRisk: calculateUpcomingHarvestRisk(snapshot, status),
  };
}

export function analyzeAllCrops(): DemandAnalysis[] {
  return DEMO_SUPPLY_DEMAND.map((s) =>
    analyzeDemand({
      crop: s.crop,
      currentSupply: s.supplyKg,
      buyerDemand: s.demandKg,
    })
  );
}
