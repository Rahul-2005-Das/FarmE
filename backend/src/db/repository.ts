import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { DEMO_BUYERS, DEMO_FARMER, DEMO_CROPS, DEMO_BUYER_REQUIREMENTS } from '../../../src/data/mockData.ts';
import type { Buyer, BuyerDemand, CropRecommendationRecord, EmergencyCase, Farmer, Listing, LogisticsPlan, Order } from '../types.js';

const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));

export class Repository {
  private readonly pool?: Pool;
  private readonly memory = {
    farmers: new Map<string, Farmer>(),
    buyers: new Map<string, Buyer>(),
    listings: new Map<string, Listing>(),
    demands: new Map<string, BuyerDemand>(),
    orders: new Map<string, Order>(),
    logistics: new Map<string, LogisticsPlan>(),
    emergency: new Map<string, EmergencyCase>(),
    recommendations: new Map<string, CropRecommendationRecord>(),
  };

  constructor() {
    if (process.env.DATABASE_URL) {
      this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    }
    this.seedMemory();
  }

  get databaseEnabled(): boolean {
    return Boolean(this.pool);
  }

  async init(): Promise<void> {
    if (!this.pool) return;
    const schema = await readFile(schemaPath, 'utf8');
    await this.pool.query(schema);
  }

  async close(): Promise<void> {
    await this.pool?.end();
  }

  private seedMemory(): void {
    const farmer: Farmer = {
      id: DEMO_FARMER.id,
      role: 'farmer',
      name: DEMO_FARMER.name,
      mobile: DEMO_FARMER.mobile,
      district: DEMO_FARMER.district,
      village: DEMO_FARMER.village,
      landAreaAcres: DEMO_FARMER.farmSizeAcres,
      preferredLanguage: DEMO_FARMER.language,
      createdAt: DEMO_FARMER.createdAt,
    };
    this.memory.farmers.set(farmer.id, farmer);
    for (const buyer of DEMO_BUYERS) {
      this.memory.buyers.set(buyer.id, {
        id: buyer.id,
        role: 'buyer',
        name: buyer.name,
        businessName: buyer.businessName,
        buyerType: buyer.buyerType,
        district: buyer.district,
        reliabilityScore: 90,
        createdAt: buyer.createdAt,
      });
    }
    for (const crop of DEMO_CROPS) {
      this.memory.listings.set(crop.id, {
        id: crop.id,
        farmerId: crop.farmerId,
        crop: crop.cropNameEn,
        quantityKg: crop.quantityKg,
        quality: crop.qualityGrade,
        expectedPricePerKg: crop.expectedPricePerKg,
        harvestDate: crop.harvestDate,
        district: crop.farmerDistrict,
        village: crop.farmerVillage,
        status: crop.status,
        createdAt: new Date().toISOString(),
      });
    }
    for (const requirement of DEMO_BUYER_REQUIREMENTS) {
      this.memory.demands.set(`demo-${requirement.buyerId}-${requirement.crop}`, {
        id: `demo-${requirement.buyerId}-${requirement.crop}`,
        buyerId: requirement.buyerId,
        crop: requirement.crop,
        quantityKg: requirement.requiredQuantityKg,
        targetPricePerKg: requirement.offeredPricePerKg,
        requiredDate: `Within ${requirement.deliveryDeadlineDays} days`,
        district: requirement.district,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }
  }

  async upsertFarmer(input: Omit<Farmer, 'role' | 'createdAt'> & Partial<Pick<Farmer, 'createdAt'>>): Promise<Farmer> {
    const farmer: Farmer = { ...input, role: 'farmer', createdAt: input.createdAt ?? new Date().toISOString() };
    if (!this.pool) {
      this.memory.farmers.set(farmer.id, farmer);
      return farmer;
    }
    await this.pool.query(`INSERT INTO users (id, role, name, mobile, district) VALUES ($1, 'farmer', $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name=$2, mobile=$3, district=$4`, [farmer.id, farmer.name, farmer.mobile, farmer.district]);
    await this.pool.query(`INSERT INTO farmer_profiles (user_id, soil_type, water_source, land_area_acres, village, preferred_language) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (user_id) DO UPDATE SET soil_type=$2, water_source=$3, land_area_acres=$4, village=$5, preferred_language=$6`, [farmer.id, farmer.soilType, farmer.waterSource, farmer.landAreaAcres, farmer.village, farmer.preferredLanguage]);
    return farmer;
  }

  async getFarmer(id: string): Promise<Farmer | null> {
    if (!this.pool) return this.memory.farmers.get(id) ?? null;
    const result = await this.pool.query(`SELECT u.id,u.role,u.name,u.mobile,u.district,u.created_at,fp.soil_type,fp.water_source,fp.land_area_acres,fp.village,fp.preferred_language FROM users u LEFT JOIN farmer_profiles fp ON fp.user_id=u.id WHERE u.id=$1 AND u.role='farmer'`, [id]);
    const row = result.rows[0];
    return row ? { id: row.id, role: 'farmer', name: row.name, mobile: row.mobile, district: row.district, village: row.village, soilType: row.soil_type, waterSource: row.water_source, landAreaAcres: Number(row.land_area_acres ?? 0), preferredLanguage: row.preferred_language, createdAt: row.created_at.toISOString() } : null;
  }

  async createListing(listing: Listing): Promise<Listing> {
    if (!this.pool) {
      this.memory.listings.set(listing.id, listing);
      return listing;
    }
    await this.pool.query(`INSERT INTO listings (id,farmer_id,crop,quantity_kg,quality,expected_price_per_kg,harvest_date,district,village,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [listing.id, listing.farmerId, listing.crop, listing.quantityKg, listing.quality, listing.expectedPricePerKg, listing.harvestDate, listing.district, listing.village, listing.status]);
    return listing;
  }

  async listListings(): Promise<Listing[]> {
    if (!this.pool) return [...this.memory.listings.values()];
    const result = await this.pool.query('SELECT id,farmer_id,crop,quantity_kg,quality,expected_price_per_kg,harvest_date,district,village,status,created_at FROM listings ORDER BY created_at DESC');
    return result.rows.map((row) => this.mapListing(row));
  }

  async getListing(id: string): Promise<Listing | null> {
    if (!this.pool) return this.memory.listings.get(id) ?? null;
    const result = await this.pool.query('SELECT id,farmer_id,crop,quantity_kg,quality,expected_price_per_kg,harvest_date,district,village,status,created_at FROM listings WHERE id=$1', [id]);
    return result.rows[0] ? this.mapListing(result.rows[0]) : null;
  }

  async patchListing(id: string, patch: Partial<Listing>): Promise<Listing | null> {
    const current = await this.getListing(id);
    if (!current) return null;
    const next = { ...current, ...patch, id: current.id, farmerId: current.farmerId };
    if (!this.pool) {
      this.memory.listings.set(id, next);
      return next;
    }
    await this.pool.query(`UPDATE listings SET crop=$2,quantity_kg=$3,quality=$4,expected_price_per_kg=$5,harvest_date=$6,district=$7,village=$8,status=$9 WHERE id=$1`, [id, next.crop, next.quantityKg, next.quality, next.expectedPricePerKg, next.harvestDate, next.district, next.village, next.status]);
    return next;
  }

  async createDemand(demand: BuyerDemand): Promise<BuyerDemand> {
    if (!this.pool) {
      this.memory.demands.set(demand.id, demand);
      return demand;
    }
    await this.pool.query(`INSERT INTO buyer_demands (id,buyer_id,crop,quantity_kg,target_price_per_kg,required_date,district,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [demand.id, demand.buyerId, demand.crop, demand.quantityKg, demand.targetPricePerKg, demand.requiredDate, demand.district, demand.status]);
    return demand;
  }

  async listDemands(): Promise<BuyerDemand[]> {
    if (!this.pool) return [...this.memory.demands.values()];
    const result = await this.pool.query('SELECT id,buyer_id,crop,quantity_kg,target_price_per_kg,required_date,district,status,created_at FROM buyer_demands ORDER BY created_at DESC');
    return result.rows.map((row) => this.mapDemand(row));
  }

  async createOrder(order: Order): Promise<Order> {
    if (!this.pool) {
      this.memory.orders.set(order.id, order);
      return order;
    }
    await this.pool.query(`INSERT INTO orders (id,listing_id,farmer_id,buyer_id,quantity_kg,price_per_kg,status) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [order.id, order.listingId, order.farmerId, order.buyerId, order.quantityKg, order.pricePerKg, order.status]);
    return order;
  }

  async getOrder(id: string): Promise<Order | null> {
    if (!this.pool) return this.memory.orders.get(id) ?? null;
    const result = await this.pool.query('SELECT id,listing_id,farmer_id,buyer_id,quantity_kg,price_per_kg,status,created_at FROM orders WHERE id=$1', [id]);
    return result.rows[0] ? this.mapOrder(result.rows[0]) : null;
  }

  async listOrdersByUser(userId: string, role: 'farmer' | 'buyer'): Promise<Order[]> {
    if (!this.pool) return [...this.memory.orders.values()].filter((order) => role === 'farmer' ? order.farmerId === userId : order.buyerId === userId);
    const column = role === 'farmer' ? 'farmer_id' : 'buyer_id';
    const result = await this.pool.query(`SELECT id,listing_id,farmer_id,buyer_id,quantity_kg,price_per_kg,status,created_at FROM orders WHERE ${column}=$1 ORDER BY created_at DESC`, [userId]);
    return result.rows.map((row) => this.mapOrder(row));
  }

  async saveLogistics(plan: LogisticsPlan): Promise<LogisticsPlan> {
    if (!this.pool) {
      this.memory.logistics.set(plan.id, plan);
      return plan;
    }
    await this.pool.query(`INSERT INTO logistics_plans (id,order_id,collection_point,vehicle_type,route_summary,distance_km,utilization_percent,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO UPDATE SET status=$8,route_summary=$5`, [plan.id, plan.orderId, plan.collectionPoint, plan.vehicleType, plan.routeSummary, plan.distanceKm, plan.utilizationPercent, plan.status]);
    return plan;
  }

  async getLogistics(orderId: string): Promise<LogisticsPlan | null> {
    if (!this.pool) return [...this.memory.logistics.values()].find((plan) => plan.orderId === orderId) ?? null;
    const result = await this.pool.query('SELECT id,order_id,collection_point,vehicle_type,route_summary,distance_km,utilization_percent,status,created_at FROM logistics_plans WHERE order_id=$1 ORDER BY created_at DESC LIMIT 1', [orderId]);
    return result.rows[0] ? this.mapLogistics(result.rows[0]) : null;
  }

  async saveEmergency(item: EmergencyCase): Promise<EmergencyCase> {
    if (!this.pool) {
      this.memory.emergency.set(item.id, item);
      return item;
    }
    await this.pool.query(`INSERT INTO emergency_cases (id,order_id,cancelled_quantity_kg,risk_score,status) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO UPDATE SET cancelled_quantity_kg=$3,risk_score=$4,status=$5`, [item.id, item.orderId, item.cancelledQuantityKg, item.riskScore, item.status]);
    return item;
  }

  async getEmergency(orderId: string): Promise<EmergencyCase | null> {
    if (!this.pool) return [...this.memory.emergency.values()].find((item) => item.orderId === orderId) ?? null;
    const result = await this.pool.query('SELECT id,order_id,cancelled_quantity_kg,risk_score,status,created_at FROM emergency_cases WHERE order_id=$1 ORDER BY created_at DESC LIMIT 1', [orderId]);
    return result.rows[0] ? this.mapEmergency(result.rows[0]) : null;
  }

  async saveRecommendation(item: CropRecommendationRecord): Promise<CropRecommendationRecord> {
    if (!this.pool) {
      this.memory.recommendations.set(item.id, item);
      return item;
    }
    await this.pool.query(`INSERT INTO crop_recommendations (id,farmer_id,inputs,recommendations,mode) VALUES ($1,$2,$3,$4,$5)`, [item.id, item.farmerId, item.inputs, item.recommendations, item.mode]);
    return item;
  }

  async listRecommendations(farmerId: string): Promise<CropRecommendationRecord[]> {
    if (!this.pool) return [...this.memory.recommendations.values()].filter((item) => item.farmerId === farmerId);
    const result = await this.pool.query('SELECT id,farmer_id,inputs,recommendations,mode,created_at FROM crop_recommendations WHERE farmer_id=$1 ORDER BY created_at DESC', [farmerId]);
    return result.rows.map((row) => ({ id: row.id, farmerId: row.farmer_id, inputs: row.inputs, recommendations: row.recommendations, mode: row.mode, createdAt: row.created_at.toISOString() }));
  }

  private mapListing(row: any): Listing { return { id: row.id, farmerId: row.farmer_id, crop: row.crop, quantityKg: Number(row.quantity_kg), quality: row.quality, expectedPricePerKg: Number(row.expected_price_per_kg), harvestDate: row.harvest_date, district: row.district, village: row.village, status: row.status, createdAt: row.created_at.toISOString() }; }
  private mapDemand(row: any): BuyerDemand { return { id: row.id, buyerId: row.buyer_id, crop: row.crop, quantityKg: Number(row.quantity_kg), targetPricePerKg: Number(row.target_price_per_kg), requiredDate: row.required_date, district: row.district, status: row.status, createdAt: row.created_at.toISOString() }; }
  private mapOrder(row: any): Order { return { id: row.id, listingId: row.listing_id, farmerId: row.farmer_id, buyerId: row.buyer_id, quantityKg: Number(row.quantity_kg), pricePerKg: Number(row.price_per_kg), status: row.status, createdAt: row.created_at.toISOString() }; }
  private mapLogistics(row: any): LogisticsPlan { return { id: row.id, orderId: row.order_id, collectionPoint: row.collection_point, vehicleType: row.vehicle_type, routeSummary: row.route_summary, distanceKm: Number(row.distance_km), utilizationPercent: Number(row.utilization_percent), status: row.status, createdAt: row.created_at.toISOString() }; }
  private mapEmergency(row: any): EmergencyCase { return { id: row.id, orderId: row.order_id, cancelledQuantityKg: Number(row.cancelled_quantity_kg), riskScore: Number(row.risk_score), status: row.status, createdAt: row.created_at.toISOString() }; }

  newId(prefix: string): string { return `${prefix}-${randomUUID()}`; }
}
