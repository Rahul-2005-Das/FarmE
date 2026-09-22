import { BuyerDemandPost, CropRecommendationResult, EmergencyCase, FarmerProduceListing, LogisticsPlan, Order } from '../types';
import { generateLogisticsPlan } from './logisticsEngine';

export const FARMER_LISTINGS_KEY = 'krishok_bandhu_farmer_listings';
export const BUYER_DEMANDS_KEY = 'krishok_bandhu_buyer_demands';
export const DRAFT_LISTING_KEY = 'krishok_bandhu_draft_listing';
export const ORDERS_KEY = 'krishok_bandhu_orders';
export const LOGISTICS_PLANS_KEY = 'krishok_bandhu_logistics_plans';
export const EMERGENCY_CASES_KEY = 'krishok_bandhu_emergency_cases';
export const CROP_RECOMMENDATIONS_KEY = 'krishok_bandhu_crop_recommendations';

export function loadCropRecommendations(farmerId?: string): CropRecommendationResult[] {
  try {
    const raw = localStorage.getItem(CROP_RECOMMENDATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return farmerId ? parsed.filter((item) => item?.farmerId === farmerId) : parsed;
  } catch {
    return [];
  }
}

export function saveCropRecommendations(recommendations: CropRecommendationResult[]): void {
  try {
    localStorage.setItem(CROP_RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
  } catch {
    // ignore
  }
}

export function loadFarmerListings(): FarmerProduceListing[] {
  try {
    const raw = localStorage.getItem(FARMER_LISTINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFarmerListings(listings: FarmerProduceListing[]): void {
  try {
    localStorage.setItem(FARMER_LISTINGS_KEY, JSON.stringify(listings));
  } catch {
    // localStorage unavailable — ignore silently for prototype
  }
}

export function loadBuyerDemands(): BuyerDemandPost[] {
  try {
    const raw = localStorage.getItem(BUYER_DEMANDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBuyerDemands(demands: BuyerDemandPost[]): void {
  try {
    localStorage.setItem(BUYER_DEMANDS_KEY, JSON.stringify(demands));
  } catch {
    // ignore
  }
}

export function addBuyerDemand(demand: BuyerDemandPost): BuyerDemandPost[] {
  const existing = loadBuyerDemands();
  const next = [demand, ...existing];
  saveBuyerDemands(next);
  return next;
}

export function loadDraftListing(): Partial<FarmerProduceListing> | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_LISTING_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getActiveFarmerListing(
  farmerId?: string
): FarmerProduceListing | Partial<FarmerProduceListing> {
  const listings = loadFarmerListings();
  if (farmerId) {
    const mine = listings.find((l) => l.farmerId === farmerId);
    if (mine) return mine;
    const draft = loadDraftListing();
    if (draft && (!draft.farmerId || draft.farmerId === farmerId)) return draft;
    // Never fall back to another farmer's saved listing.
    return {};
  }
  if (listings[0]) return listings[0];

  const draft = loadDraftListing();
  if (draft) return draft;
  return {};
}

export function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // Ignore unavailable browser storage.
  }
}

export function upsertOrder(order: Order): Order[] {
  const orders = [order, ...loadOrders().filter((item) => item.id !== order.id)];
  saveOrders(orders);
  return orders;
}

export function updateOrderStatus(orderId: string | undefined, status: Order['status']): Order[] {
  if (!orderId) return loadOrders();
  const orders = loadOrders().map((order) => order.id === orderId ? { ...order, status } : order);
  saveOrders(orders);
  return orders;
}

export function getOrdersForBuyer(buyerId?: string): Order[] {
  const orders = loadOrders();
  if (!buyerId) return orders;
  return orders.filter((order) => order.buyerId === buyerId);
}

export function getOrdersForFarmer(farmerId?: string): Order[] {
  const orders = loadOrders();
  if (!farmerId) return orders;
  return orders.filter((order) => order.farmerId === farmerId);
}

export function getLatestOrderForUser(userId?: string, role?: 'buyer' | 'farmer'): Order | undefined {
  if (!userId || !role) return undefined;
  const orders = role === 'buyer' ? getOrdersForBuyer(userId) : getOrdersForFarmer(userId);
  return orders[0];
}

export function loadLogisticsPlans(): LogisticsPlan[] {
  try {
    const raw = localStorage.getItem(LOGISTICS_PLANS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLogisticsPlans(plans: LogisticsPlan[]): void {
  try {
    localStorage.setItem(LOGISTICS_PLANS_KEY, JSON.stringify(plans));
  } catch {
    // localStorage unavailable — keep the demo usable in memory
  }
}

export function saveLogisticsPlan(plan: LogisticsPlan): LogisticsPlan[] {
  const plans = [plan, ...loadLogisticsPlans().filter((item) => item.id !== plan.id && item.orderId !== plan.orderId)];
  saveLogisticsPlans(plans);
  return plans;
}

export function loadOrderLogistics(orderId?: string): LogisticsPlan | null {
  const plans = loadLogisticsPlans();
  if (!orderId) return null;
  return plans.find((plan) => plan.orderId === orderId) ?? null;
}

export function loadCurrentLogisticsPlan(): LogisticsPlan | null {
  const latestOrder = loadOrders()[0];
  if (latestOrder) return loadOrderLogistics(latestOrder.id) ?? createOrderLogisticsPlan(latestOrder);
  return loadLogisticsPlans()[0] ?? null;
}

export function createOrderLogisticsPlan(order: Order): LogisticsPlan {
  const status = order.status === 'delivered' ? 'Delivered' : order.status === 'dispatched' ? 'In Transit' : 'Order Confirmed';
  const statusSequence: LogisticsPlan['status'][] = ['Order Confirmed', 'Farmers Grouped', 'Collection Planned', 'Vehicle Assigned', 'Pickup Started', 'Pickup Completed', 'In Transit', 'Near Buyer', 'Delivered'];
  const statusIndex = statusSequence.indexOf(status);
  const firstQuantity = Math.round(order.quantityKg * 0.36);
  const secondQuantity = Math.round(order.quantityKg * 0.24);
  const thirdQuantity = Math.max(0, order.quantityKg - firstQuantity - secondQuantity);
  const plan = generateLogisticsPlan(
    [
      {
        id: `${order.farmerId}-${order.id}`,
        name: order.farmerName,
        location: order.pickupLocation,
        crop: order.cropNameEn,
        quantityKg: firstQuantity,
        grade: 'Grade A',
        harvestDate: order.deliveryDate,
      },
      {
        id: `nearby-farmer-b-${order.id}`,
        name: 'Nearby Farmer B',
        location: 'Baruipur',
        crop: order.cropNameEn,
        quantityKg: secondQuantity,
        grade: 'Grade A',
        harvestDate: order.deliveryDate,
      },
      {
        id: `nearby-farmer-c-${order.id}`,
        name: 'Nearby Farmer C',
        location: 'Champahati',
        crop: order.cropNameEn,
        quantityKg: thirdQuantity,
        grade: 'Grade A',
        harvestDate: order.deliveryDate,
      },
    ],
    order.buyerName,
    order.destinationLocation,
  );
  return {
    ...plan,
    id: `LOG-${order.id}`,
    orderId: order.id,
    buyerName: order.buyerName,
    buyerLocation: order.destinationLocation,
    crop: order.cropNameEn,
    totalQuantityKg: order.quantityKg,
    status,
    orderStatus: order.status,
    timeline: plan.timeline.map((event, index) => ({ ...event, completed: index <= statusIndex, current: index === statusIndex })),
    createdAt: new Date().toISOString(),
  };
}

export function loadEmergencyCases(): EmergencyCase[] {
  try {
    const raw = localStorage.getItem(EMERGENCY_CASES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEmergencyCases(cases: EmergencyCase[]): void {
  try {
    localStorage.setItem(EMERGENCY_CASES_KEY, JSON.stringify(cases));
  } catch {
    // Keep the prototype usable if browser storage is unavailable.
  }
}

export function saveEmergencyCase(emergencyCase: EmergencyCase): EmergencyCase[] {
  const cases = [emergencyCase, ...loadEmergencyCases().filter((item) => item.id !== emergencyCase.id && item.orderId !== emergencyCase.orderId)];
  saveEmergencyCases(cases);
  return cases;
}

export function loadOrderEmergencyCase(orderId?: string): EmergencyCase | null {
  const cases = loadEmergencyCases();
  if (!orderId) return null;
  return cases.find((item) => item.orderId === orderId) ?? null;
}

export function loadCurrentEmergencyCase(): EmergencyCase | null {
  const latestOrder = loadOrders()[0];
  if (latestOrder) return loadOrderEmergencyCase(latestOrder.id);
  return loadEmergencyCases()[0] ?? null;
}

export function clearEmergencyCases(): void {
  try {
    localStorage.removeItem(EMERGENCY_CASES_KEY);
  } catch {
    // Ignore unavailable browser storage.
  }
}
