import {
  CollectionPoint,
  LogisticsFarmer,
  LogisticsPlan,
  VehicleOption,
  VehiclePlan,
  LogisticsEfficiencyMetrics,
} from '../types';
import { generateRouteRecommendation } from './routeEngine';

export const DEMO_LOGISTICS_FARMERS: LogisticsFarmer[] = [
  { id: 'lf-1', name: 'Farmer A', location: 'Sonarpur', crop: 'Tomato', quantityKg: 200, grade: 'Grade A', harvestDate: 'Ready' },
  { id: 'lf-2', name: 'Farmer B', location: 'Baruipur', crop: 'Tomato', quantityKg: 300, grade: 'Grade A', harvestDate: 'Ready' },
  { id: 'lf-3', name: 'Farmer C', location: 'Champahati', crop: 'Tomato', quantityKg: 250, grade: 'Grade A', harvestDate: 'Ready' },
];

export const DEMO_COLLECTION_POINTS: CollectionPoint[] = [
  { id: 'cp-champahati', name: 'Champahati Collection Point', location: 'Champahati', capacityKg: 2000, farmerDistanceKm: 8, buyerDistanceKm: 28, suitabilityScore: 94 },
  { id: 'cp-baruipur', name: 'Baruipur Collection Point', location: 'Baruipur', capacityKg: 1800, farmerDistanceKm: 10, buyerDistanceKm: 32, suitabilityScore: 88 },
  { id: 'cp-sonarpur', name: 'Sonarpur Collection Point', location: 'Sonarpur', capacityKg: 1500, farmerDistanceKm: 14, buyerDistanceKm: 36, suitabilityScore: 82 },
  { id: 'cp-garia', name: 'Garia Collection Point', location: 'Garia', capacityKg: 1200, farmerDistanceKm: 18, buyerDistanceKm: 24, suitabilityScore: 76 },
];

export const DEMO_VEHICLES: VehicleOption[] = [
  { id: 'mini-truck', name: 'Mini Truck', capacityKg: 1000 },
  { id: 'medium-truck', name: 'Medium Truck', capacityKg: 2500 },
  { id: 'large-truck', name: 'Large Truck', capacityKg: 5000 },
];

export function calculateDistance(from: string, to: string): number {
  if (from === to) return 0;
  const known: Record<string, number> = {
    'Sonarpur-Baruipur': 10,
    'Baruipur-Champahati': 12,
    'Champahati-Kolkata Fresh Mart': 28,
  };
  return known[`${from}-${to}`] ?? known[`${to}-${from}`] ?? 8;
}

export function groupNearbyFarmers(farmers = DEMO_LOGISTICS_FARMERS): LogisticsFarmer[] {
  const targetCrop = farmers[0]?.crop ?? 'Tomato';
  return farmers.filter((farmer) => farmer.crop === targetCrop && farmer.grade === 'Grade A');
}

export function calculateVehicleRequirement(quantityKg: number, vehicles = DEMO_VEHICLES): VehiclePlan {
  const vehicle = vehicles.find((option) => option.capacityKg >= quantityKg) ?? vehicles[vehicles.length - 1];
  const usedKg = Math.min(quantityKg, vehicle.capacityKg);
  return {
    ...vehicle,
    usedKg,
    remainingKg: Math.max(0, vehicle.capacityKg - usedKg),
    utilizationPercent: Math.round((usedKg / vehicle.capacityKg) * 100),
  };
}

export function optimizeVehicleLoad(quantityKg: number, vehicle: VehiclePlan): VehiclePlan {
  return {
    ...vehicle,
    usedKg: Math.min(quantityKg, vehicle.capacityKg),
    remainingKg: Math.max(0, vehicle.capacityKg - quantityKg),
    utilizationPercent: Math.round((Math.min(quantityKg, vehicle.capacityKg) / vehicle.capacityKg) * 100),
  };
}

export function selectCollectionPoint(totalQuantityKg: number, points = DEMO_COLLECTION_POINTS): CollectionPoint {
  return [...points]
    .filter((point) => point.capacityKg >= totalQuantityKg)
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)[0] ?? points[0];
}

export function calculateCollectionEfficiency(farmerCount: number, totalQuantityKg: number): number {
  return farmerCount > 0 ? Math.round((totalQuantityKg / (farmerCount * 1000)) * 100) : 0;
}

export function calculateDeliverySchedule(): LogisticsPlan['deliverySchedule'] {
  return {
    pickupSlot: '08:00–09:00',
    departureTime: '10:00',
    estimatedArrival: '11:30',
    deliveryWindow: '11:30–12:00',
  };
}

export function calculateLogisticsCost(totalQuantityKg: number, distanceKm: number, utilizationPercent: number): LogisticsPlan['costIntelligence'] {
  const baseCost = 1500;
  const distanceCost = distanceKm * 15;
  const loadEfficiencyBonus = utilizationPercent >= 75 ? -500 : 0;
  const totalCost = baseCost + distanceCost + loadEfficiencyBonus;
  return {
    baseCost,
    distanceCost,
    loadEfficiencyBonus,
    totalCost,
    costPerKg: Number((totalCost / totalQuantityKg).toFixed(2)),
  };
}

export function calculateEfficiencyMetrics(vehicleUtilization: number, routeEfficiency: number, farmersCount: number, collectionSuitability: number): LogisticsEfficiencyMetrics {
  const aggregation = farmersCount > 1 ? 95 : 50;
  const deliverySchedule = 80;
  return {
    vehicleUtilization,
    routeEfficiency,
    aggregation,
    collectionPoint: collectionSuitability,
    deliverySchedule,
  };
}

export function generateLogisticsPlan(
  farmers = DEMO_LOGISTICS_FARMERS,
  buyerName = 'Kolkata Fresh Mart',
  buyerLocation = 'Kolkata Fresh Mart'
): LogisticsPlan {
  const grouped = groupNearbyFarmers(farmers);
  const totalQuantityKg = grouped.reduce((total, farmer) => total + farmer.quantityKg, 0);
  const collectionPoint = selectCollectionPoint(totalQuantityKg);
  const vehicle = optimizeVehicleLoad(totalQuantityKg, calculateVehicleRequirement(totalQuantityKg));
  const route = generateRouteRecommendation(grouped, collectionPoint.location, buyerLocation);
  const statuses = ['Order Confirmed', 'Farmers Grouped', 'Collection Planned', 'Vehicle Assigned', 'Pickup Started', 'Pickup Completed', 'In Transit', 'Near Buyer', 'Delivered'] as const;
  const currentIndex = statuses.indexOf('In Transit');

  const efficiencyMetrics = calculateEfficiencyMetrics(vehicle.utilizationPercent, route.routeScore, grouped.length, collectionPoint.suitabilityScore);
  const overallEfficiency = Math.round(
    (efficiencyMetrics.vehicleUtilization +
      efficiencyMetrics.routeEfficiency +
      efficiencyMetrics.aggregation +
      efficiencyMetrics.collectionPoint +
      efficiencyMetrics.deliverySchedule) / 5
  );

  return {
    id: 'LOG-DEMO-001',
    crop: grouped[0]?.crop ?? 'Tomato',
    farmers: grouped,
    totalQuantityKg,
    collectionPoint,
    vehicle,
    route,
    buyerName,
    buyerLocation,
    status: 'In Transit',
    efficiencyPercent: overallEfficiency,
    efficiencyMetrics,
    deliverySchedule: calculateDeliverySchedule(),
    costIntelligence: calculateLogisticsCost(totalQuantityKg, route.totalDistanceKm, vehicle.utilizationPercent),
    savings: {
      individualShipments: grouped.length,
      individualDistanceKm: route.traditionalDistanceKm,
      coordinatedDistanceKm: route.totalDistanceKm,
      distanceReducedKm: route.distanceReducedKm,
      distanceReducedPercent: route.reductionPercent,
    },
    createdAt: new Date().toISOString(),
    timeline: statuses.map((status, index) => ({ status, completed: index <= currentIndex, current: index === currentIndex })),
  };
}