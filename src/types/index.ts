export type UserRole = 'farmer' | 'buyer' | 'fleet' | 'admin' | null;

export type Language = 'bn' | 'en' | 'hi';

export interface User {
  id: string;
  mobile: string;
  name: string;
  role: UserRole;
  language: Language;
  avatar?: string;
  createdAt: string;
}

export interface FarmerProfile extends User {
  role: 'farmer';
  district: string;
  subdivision?: string;
  village: string;
  pinCode?: string;
  farmSizeAcres?: number;
  primaryCrops: string[];
  kisanCreditCard?: boolean;
}

export type BuyerType = 'Retailer' | 'Wholesaler' | 'Restaurant' | 'Institutional Buyer';

export interface BuyerProfile extends User {
  role: 'buyer';
  businessName: string;
  buyerType: BuyerType;
  tradeLicenseNumber?: string;
  district: string;
  address: string;
  deliveryPreference: 'Mandi Pickup' | 'Direct Farm Pickup' | 'Central Hub Delivery';
}

export type ProduceGrade = 'Grade A' | 'Grade B' | 'Grade C' | 'Not sure';

export interface FarmerProduceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  crop: string;
  cropBn?: string;
  cropHi?: string;
  quantity: number;
  unit: string; // 'kg'
  grade: ProduceGrade;
  expectedPrice: number;
  harvestDate: string; // e.g. "Today", "Tomorrow", "Within 3 days", "Within 7 days", "2026-03-20"
  location: {
    district: string;
    village: string;
  };
  status: 'Looking for Buyers' | 'Matched' | 'Negotiation' | 'Sold';
  createdAt: string;
  photoUrl?: string;
  aiRecommendation?: AIRecommendation;
}

export interface AIRecommendation {
  demandLevel: 'High demand' | 'Medium demand' | 'Moderate demand';
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  sellingStrategy: string;
  sellingStrategyBn: string;
  sellingStrategyHi: string;
  marketOpportunity: string;
  marketOpportunityBn: string;
  marketOpportunityHi: string;
  freshnessRisk: string;
  freshnessRiskBn: string;
  freshnessRiskHi: string;
  recommendedAction: string;
  recommendedActionBn: string;
  recommendedActionHi: string;
  whyFactors: {
    title: string;
    titleBn: string;
    titleHi: string;
    description: string;
    descriptionBn: string;
    descriptionHi: string;
  }[];
}

export interface CropRecommendationBuyer {
  buyerName: string;
  buyerType: string;
  offeredPricePerKg: number;
  requiredQuantityKg: number;
  district: string;
}

export interface CropRecommendationOpportunity {
  crop: string;
  market: string;
  district: string;
  demandStatus: 'High demand' | 'Surplus' | 'Balanced';
  buyerMatches: CropRecommendationBuyer[];
  expectedPrice: {
    min: number;
    max: number;
    recommended: number;
  };
  farmToMarketOpportunity: {
    route: string;
    logisticsSavings: number;
    collectionPoint: string;
    expectedMargin: number;
  };
  risk: 'Low' | 'Medium' | 'High';
  estimatedReturn: number;
  score: number;
  reason: string;
}

export interface CropRecommendationResult {
  farmerId: string;
  farmerName: string;
  district: string;
  soil: string;
  waterAvailability: string;
  generatedAt: string;
  summary: string;
  opportunities: CropRecommendationOpportunity[];
}

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  farmerDistrict: string;
  farmerMobile: string;
  cropNameBn: string;
  cropNameEn: string;
  category: 'Vegetables' | 'Grains' | 'Fruits' | 'Pulses' | 'Oilseeds';
  variety: string;
  quantityKg: number;
  qualityGrade: 'Grade A' | 'Grade B' | 'Export Quality';
  harvestDate: string; // e.g., "Ready in 4 days"
  expectedPricePerKg: number;
  minimumOfferPrice?: number;
  status: 'active' | 'in_negotiation' | 'sold';
  photoUrl?: string;
  verifiedByFPO?: boolean;
}

export interface Order {
  id: string;
  cropListingId: string;
  cropNameBn: string;
  cropNameEn: string;
  quantityKg: number;
  agreedPricePerKg: number;
  totalAmount: number;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  status: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryDate: string;
  pickupLocation: string;
  destinationLocation: string;
  allocationLines?: AllocationLine[];
  logisticsPlanId?: string;
  emergencyCaseId?: string;
}

export interface MarketPrice {
  cropNameBn: string;
  cropNameEn: string;
  mandiName: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  updatedAt: string;
}

export interface AIAdvice {
  id: string;
  titleBn: string;
  titleEn: string;
  summaryBn: string;
  summaryEn: string;
  urgency: 'high' | 'medium' | 'info';
  category: 'price' | 'weather' | 'pest' | 'demand';
  timestamp: string;
}

export interface BuyerDemandPost {
  id: string;
  buyerId: string;
  buyerName: string;
  crop: string;
  requiredQuantityKg: number;
  quality: ProduceGrade;
  maxPricePerKg: number;
  deliveryDate: string;
  district: string;
  createdAt: string;
}

export interface BuyerRequirement {
  buyerId: string;
  businessName: string;
  buyerType: BuyerType;
  crop: string;
  requiredQuantityKg: number;
  minimumQuality: ProduceGrade | string;
  offeredPricePerKg: number;
  district: string;
  deliveryDeadlineDays: number;
}

export type MatchLevel = 'Excellent' | 'Strong' | 'Good' | 'Fair';

export interface MatchBreakdown {
  crop: number;
  quantity: number;
  quality: number;
  price: number;
  distance: number;
  timing: number;
}

export interface BuyerMatchResult {
  buyerId: string;
  buyerName: string;
  buyerType: BuyerType;
  requiredQuantityKg: number;
  offeredPricePerKg: number;
  district: string;
  deliveryDeadlineDays: number;
  score: number;
  matchLevel: MatchLevel;
  breakdown: MatchBreakdown;
  explanation: string;
  recommended: boolean;
}

export interface AllocationLine {
  buyerId: string;
  buyerName: string;
  quantityKg: number;
  pricePerKg: number;
}

export type DemandStatus = 'HIGH_DEMAND' | 'SURPLUS' | 'BALANCED';

export interface SupplyDemandSnapshot {
  crop: string;
  supplyKg: number;
  demandKg: number;
  upcomingHarvestKg?: number;
  farmersHarvestingSoon?: number;
}

export interface DemandAnalysis {
  crop: string;
  supply: number;
  demand: number;
  gap: number;
  status: DemandStatus;
  demandScore: number;
  confidence: number;
  explanation: string;
  upcomingHarvestRisk: string;
}

export interface PriceIntelligence {
  crop: string;
  marketMin: number;
  marketMax: number;
  farmerExpected: number;
  bestOffer: number;
  recommendedMin: number;
  recommendedMax: number;
  pricePosition: 'above_market' | 'within_market' | 'below_market';
  explanation: string;
  buyerOffers: number[];
}

export interface LogisticsFarmer {
  id: string;
  name: string;
  location: string;
  crop: string;
  quantityKg: number;
  grade: ProduceGrade;
  harvestDate: string;
  distanceToCollectionKm?: number;
}

export interface CollectionPoint {
  id: string;
  name: string;
  location: string;
  capacityKg: number;
  farmerDistanceKm: number;
  buyerDistanceKm: number;
  suitabilityScore: number;
}

export interface VehicleOption {
  id: string;
  name: string;
  capacityKg: number;
}

export interface VehiclePlan extends VehicleOption {
  usedKg: number;
  remainingKg: number;
  utilizationPercent: number;
}

export interface RouteStop {
  name: string;
  type: 'farmer' | 'collection' | 'buyer';
  distanceFromPreviousKm: number;
}

export interface RoutePlan {
  stops: RouteStop[];
  totalDistanceKm: number;
  routeScore: number;
  recommendation: string;
  traditionalDistanceKm: number;
  distanceReducedKm: number;
  reductionPercent: number;
}

export type ShipmentStatus =
  | 'Order Confirmed'
  | 'Farmers Grouped'
  | 'Collection Planned'
  | 'Vehicle Assigned'
  | 'Pickup Started'
  | 'Pickup Completed'
  | 'In Transit'
  | 'Near Buyer'
  | 'Delivered';

export interface ShipmentTimelineEvent {
  status: ShipmentStatus;
  completed: boolean;
  current?: boolean;
}

export interface LogisticsDeliverySchedule {
  pickupSlot: string;
  departureTime: string;
  estimatedArrival: string;
  deliveryWindow: string;
}

export interface LogisticsCostIntelligence {
  baseCost: number;
  distanceCost: number;
  loadEfficiencyBonus: number;
  totalCost: number;
  costPerKg: number;
}

export interface LogisticsSavings {
  individualShipments: number;
  individualDistanceKm: number;
  coordinatedDistanceKm: number;
  distanceReducedKm: number;
  distanceReducedPercent: number;
}

export interface LogisticsEfficiencyMetrics {
  vehicleUtilization: number;
  routeEfficiency: number;
  aggregation: number;
  collectionPoint: number;
  deliverySchedule: number;
}

export interface LogisticsPlan {
  id: string;
  crop: string;
  farmers: LogisticsFarmer[];
  totalQuantityKg: number;
  collectionPoint: CollectionPoint;
  vehicle: VehiclePlan;
  route: RoutePlan;
  buyerName: string;
  buyerLocation: string;
  status: ShipmentStatus;
  efficiencyPercent: number;
  efficiencyMetrics?: LogisticsEfficiencyMetrics;
  deliverySchedule?: LogisticsDeliverySchedule;
  costIntelligence?: LogisticsCostIntelligence;
  savings?: LogisticsSavings;
  createdAt: string;
  timeline: ShipmentTimelineEvent[];
  orderId?: string;
  orderStatus?: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  recoveryCaseId?: string;
}

export type EmergencyUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FreshnessRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RecoveryStatus = 'Detected' | 'Searching' | 'Matched' | 'Recovery Confirmed' | 'Logistics Planned' | 'Recovered';

export interface AlternativeBuyer {
  id: string;
  name: string;
  location: string;
  requiredQuantityKg: number;
  offerPerKg: number;
  distanceKm: number;
  urgency: 'High' | 'Medium';
  reliability: number;
  matchScore: number;
  capacityFit: number;
  priceFit: number;
  distanceFit: number;
  urgencyFit: number;
  freshnessFit: number;
}

export interface RecoveryAllocation {
  buyerId: string;
  buyerName: string;
  quantityKg: number;
  pricePerKg: number;
  totalValue: number;
}

export interface EmergencyCase {
  id: string;
  farmerName: string;
  farmerId: string;
  location: string;
  crop: string;
  totalQuantityKg: number;
  originalBuyerAllocationKg: number;
  confirmedQuantityKg: number;
  emergencyQuantityKg: number;
  quality: ProduceGrade;
  harvestWindowDays: number;
  freshnessDaysRemaining: number;
  originalExpectedPrice: number;
  marketMin: number;
  marketMax: number;
  buyerCancelled: boolean;
  urgency: EmergencyUrgency;
  riskScore: number;
  freshnessRisk: FreshnessRisk;
  status: RecoveryStatus;
  alternativeBuyers: AlternativeBuyer[];
  allocations: RecoveryAllocation[];
  createdAt: string;
  orderId?: string;
  logisticsPlanId?: string;
  recoveryLogisticsPlanId?: string;
}
