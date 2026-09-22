export type Role = 'farmer' | 'buyer' | 'admin';

export interface Farmer {
  id: string;
  role: 'farmer';
  name: string;
  mobile?: string;
  district: string;
  village?: string;
  soilType?: string;
  waterSource?: string;
  landAreaAcres?: number;
  preferredLanguage?: 'en' | 'bn' | 'hi';
  createdAt: string;
}

export interface Buyer {
  id: string;
  role: 'buyer';
  name: string;
  businessName: string;
  buyerType: string;
  district: string;
  reliabilityScore: number;
  createdAt: string;
}

export interface Listing {
  id: string;
  farmerId: string;
  crop: string;
  quantityKg: number;
  quality: string;
  expectedPricePerKg: number;
  harvestDate: string;
  district: string;
  village?: string;
  status: string;
  createdAt: string;
}

export interface BuyerDemand {
  id: string;
  buyerId: string;
  crop: string;
  quantityKg: number;
  targetPricePerKg: number;
  requiredDate: string;
  district: string;
  status: string;
  createdAt: string;
}

export interface Order {
  id: string;
  listingId: string;
  farmerId: string;
  buyerId: string;
  quantityKg: number;
  pricePerKg: number;
  status: string;
  createdAt: string;
}

export interface LogisticsPlan {
  id: string;
  orderId: string;
  collectionPoint: string;
  vehicleType: string;
  routeSummary: string;
  distanceKm: number;
  utilizationPercent: number;
  status: string;
  createdAt: string;
}

export interface EmergencyCase {
  id: string;
  orderId: string;
  cancelledQuantityKg: number;
  riskScore: number;
  status: string;
  createdAt: string;
}

export interface CropRecommendationRecord {
  id: string;
  farmerId: string;
  inputs: Record<string, unknown>;
  recommendations: unknown;
  mode: 'ai' | 'prototype';
  createdAt: string;
}
