import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { AiService } from './ai/aiService.js';
import { Repository } from './db/repository.js';

const idSchema = z.string().trim().min(1).max(120);
const farmerSchema = z.object({ id: idSchema, name: z.string().trim().min(1).max(120), mobile: z.string().trim().max(30).optional(), district: z.string().trim().min(1).max(120), village: z.string().trim().max(120).optional(), soilType: z.string().trim().max(80).optional(), waterSource: z.string().trim().max(80).optional(), landAreaAcres: z.number().nonnegative().optional(), preferredLanguage: z.enum(['en', 'bn', 'hi']).optional() });
const listingSchema = z.object({ id: idSchema.optional(), farmerId: idSchema, crop: z.string().trim().min(1).max(80), quantityKg: z.number().positive(), quality: z.string().trim().min(1).max(40), expectedPricePerKg: z.number().nonnegative(), harvestDate: z.string().trim().min(1).max(80), district: z.string().trim().min(1).max(120), village: z.string().trim().max(120).optional(), status: z.string().trim().max(40).optional() });
const demandSchema = z.object({ id: idSchema.optional(), buyerId: idSchema, crop: z.string().trim().min(1).max(80), quantityKg: z.number().positive(), targetPricePerKg: z.number().nonnegative(), requiredDate: z.string().trim().min(1).max(80), district: z.string().trim().min(1).max(120), status: z.string().trim().max(40).optional() });
const orderSchema = z.object({ id: idSchema.optional(), listingId: idSchema, farmerId: idSchema, buyerId: idSchema, quantityKg: z.number().positive(), pricePerKg: z.number().nonnegative(), status: z.string().trim().max(40).optional() });
const logisticsSchema = z.object({ id: idSchema.optional(), orderId: idSchema, collectionPoint: z.string().trim().min(1).max(160), vehicleType: z.string().trim().min(1).max(80), routeSummary: z.string().trim().min(1).max(240), distanceKm: z.number().nonnegative(), utilizationPercent: z.number().min(0).max(100), status: z.string().trim().min(1).max(40) });
const emergencySchema = z.object({ id: idSchema.optional(), orderId: idSchema, cancelledQuantityKg: z.number().positive(), riskScore: z.number().min(0).max(100), status: z.string().trim().min(1).max(50) });
const copilotSchema = z.object({ farmerId: idSchema, farmerName: z.string().trim().min(1), location: z.string().trim().min(1), soilType: z.string().trim().min(1), waterAvailability: z.string().trim().min(1), landAreaAcres: z.number().nonnegative().optional(), season: z.string().trim().max(80).optional(), preferredCrop: z.string().trim().max(80).optional(), language: z.enum(['en', 'bn', 'hi']).optional() });
const demandForecastSchema = z.object({ crop: z.string().trim().min(1).max(80), location: z.string().trim().max(120).optional(), currentSupply: z.number().nonnegative().optional(), currentDemand: z.number().nonnegative().optional(), season: z.string().trim().max(80).optional(), historicalData: z.unknown().optional(), language: z.enum(['en', 'bn', 'hi']).optional() });

function parseBody<T>(schema: z.ZodType<T>, request: Request): T {
  const result = schema.safeParse(request.body);
  if (!result.success) {
    const error = new Error(result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '));
    (error as Error & { status?: number }).status = 400;
    throw error;
  }
  return result.data;
}

export function createApp(repository = new Repository(), aiService = new AiService()) {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map((item) => item.trim()) : true }));
  app.use(express.json({ limit: '256kb' }));

  app.get('/api/health', (_request, response) => response.json({ status: 'ok', database: repository.databaseEnabled ? 'postgres' : 'memory-demo' }));

  app.post('/api/farmers', async (request, response, next) => { try { response.status(201).json(await repository.upsertFarmer(parseBody(farmerSchema, request))); } catch (error) { next(error); } });
  app.get('/api/farmers/:id', async (request, response, next) => { try { const farmer = await repository.getFarmer(request.params.id); if (farmer) response.json(farmer); else response.status(404).json({ error: 'Farmer not found' }); } catch (error) { next(error); } });

  app.post('/api/listings', async (request, response, next) => { try { const input = parseBody(listingSchema, request); response.status(201).json(await repository.createListing({ ...input, id: input.id ?? repository.newId('listing'), status: input.status ?? 'Looking for Buyers', createdAt: new Date().toISOString() })); } catch (error) { next(error); } });
  app.get('/api/listings', async (_request, response, next) => { try { response.json(await repository.listListings()); } catch (error) { next(error); } });
  app.get('/api/listings/:id', async (request, response, next) => { try { const listing = await repository.getListing(request.params.id); if (listing) response.json(listing); else response.status(404).json({ error: 'Listing not found' }); } catch (error) { next(error); } });
  app.patch('/api/listings/:id', async (request, response, next) => { try { const input = parseBody(listingSchema.partial().omit({ id: true, farmerId: true }), request); const listing = await repository.patchListing(request.params.id, input); if (listing) response.json(listing); else response.status(404).json({ error: 'Listing not found' }); } catch (error) { next(error); } });

  app.post('/api/demands', async (request, response, next) => { try { const input = parseBody(demandSchema, request); response.status(201).json(await repository.createDemand({ ...input, id: input.id ?? repository.newId('demand'), status: input.status ?? 'active', createdAt: new Date().toISOString() })); } catch (error) { next(error); } });
  app.get('/api/demands', async (_request, response, next) => { try { response.json(await repository.listDemands()); } catch (error) { next(error); } });

  app.post('/api/orders', async (request, response, next) => { try { const input = parseBody(orderSchema, request); response.status(201).json(await repository.createOrder({ ...input, id: input.id ?? repository.newId('order'), status: input.status ?? 'pending', createdAt: new Date().toISOString() })); } catch (error) { next(error); } });
  app.get('/api/orders/:id', async (request, response, next) => { try { const order = await repository.getOrder(request.params.id); order ? response.json(order) : response.status(404).json({ error: 'Order not found' }); } catch (error) { next(error); } });
  app.get('/api/farmers/:id/orders', async (request, response, next) => { try { response.json(await repository.listOrdersByUser(request.params.id, 'farmer')); } catch (error) { next(error); } });
  app.get('/api/buyers/:id/orders', async (request, response, next) => { try { response.json(await repository.listOrdersByUser(request.params.id, 'buyer')); } catch (error) { next(error); } });

  app.post('/api/logistics/plan', async (request, response, next) => { try { const input = parseBody(logisticsSchema, request); response.status(201).json(await repository.saveLogistics({ ...input, id: input.id ?? repository.newId('logistics'), createdAt: new Date().toISOString() })); } catch (error) { next(error); } });
  app.get('/api/logistics/:orderId', async (request, response, next) => { try { const plan = await repository.getLogistics(request.params.orderId); plan ? response.json(plan) : response.status(404).json({ error: 'Logistics plan not found' }); } catch (error) { next(error); } });

  app.post('/api/emergency', async (request, response, next) => { try { const input = parseBody(emergencySchema, request); response.status(201).json(await repository.saveEmergency({ ...input, id: input.id ?? repository.newId('emergency'), createdAt: new Date().toISOString() })); } catch (error) { next(error); } });
  app.get('/api/emergency/:orderId', async (request, response, next) => { try { const item = await repository.getEmergency(request.params.orderId); item ? response.json(item) : response.status(404).json({ error: 'Emergency case not found' }); } catch (error) { next(error); } });

  app.post('/api/ai/farmer-copilot', async (request, response, next) => {
    try {
      const input = parseBody(copilotSchema, request);
      const result = await aiService.farmerCopilot(input);
      await repository.saveRecommendation({
        id: repository.newId('recommendation'),
        farmerId: input.farmerId,
        inputs: input,
        recommendations: result,
        mode: result.mode,
        createdAt: new Date().toISOString(),
      });
      response.json(result);
    } catch (error) { next(error); }
  });
  app.post('/api/ai/demand-forecast', async (request, response, next) => { try { const input = parseBody(demandForecastSchema, request); response.json(await aiService.demandForecast({ crop: input.crop, location: input.location, supply: input.currentSupply, demand: input.currentDemand, season: input.season, historicalData: input.historicalData, language: input.language })); } catch (error) { next(error); } });
  app.post('/api/ai/demand', async (request, response, next) => { try { const input = parseBody(z.object({ crop: z.string().trim().min(1), location: z.string().optional(), supply: z.number().nonnegative().optional(), demand: z.number().nonnegative().optional() }), request); response.json(await aiService.demandForecast({ crop: input.crop, location: input.location, supply: input.supply, demand: input.demand })); } catch (error) { next(error); } });
  app.post('/api/ai/price', (request, response, next) => { try { response.json(aiService.priceIntelligence(parseBody(z.object({ crop: z.string().trim().min(1), farmerExpectedPrice: z.number().nonnegative(), buyerOffers: z.array(z.number().nonnegative()).optional() }), request))); } catch (error) { next(error); } });
  app.post('/api/ai/chat', async (request, response, next) => {
    try {
      const input = parseBody(z.object({
        message: z.string().trim().min(1).max(1000),
        context: z.record(z.string(), z.unknown()).optional(),
        language: z.enum(['en', 'bn', 'hi']).optional(),
      }), request);
      const result = await aiService.chat(input.message, input.context ?? {}, input.language);
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.use((error: Error & { status?: number }, _request: Request, response: Response, _next: NextFunction) => {
    response.status(error.status ?? 500).json({ error: error.status ? error.message : 'Internal server error' });
  });
  return { app, repository };
}
