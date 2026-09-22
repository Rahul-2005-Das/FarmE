import { LogisticsFarmer, RoutePlan, RouteStop } from '../types';

const DISTANCES: Record<string, number> = {
  'Sonarpur-Baruipur': 10,
  'Baruipur-Champahati': 12,
  'Champahati-Kolkata Fresh Mart': 28,
};

function distanceBetween(from: string, to: string): number {
  return DISTANCES[`${from}-${to}`] ?? DISTANCES[`${to}-${from}`] ?? 8;
}

export function calculateRouteDistance(stops: RouteStop[]): number {
  return stops.reduce((total, stop) => total + stop.distanceFromPreviousKm, 0);
}

export function optimizeCollectionSequence(
  farmers: LogisticsFarmer[],
  collectionPoint: string,
  buyer: string
): RouteStop[] {
  const ordered = [...farmers];
  const stops: RouteStop[] = [];
  let previous = '';
  ordered.forEach((farmer) => {
    stops.push({
      name: farmer.location,
      type: 'farmer',
      distanceFromPreviousKm: previous ? distanceBetween(previous, farmer.location) : 0,
    });
    previous = farmer.location;
  });
  stops.push({
    name: collectionPoint,
    type: 'collection',
    distanceFromPreviousKm: previous ? distanceBetween(previous, collectionPoint) : 0,
  });
  stops.push({
    name: buyer,
    type: 'buyer',
    distanceFromPreviousKm: distanceBetween(collectionPoint, buyer),
  });
  return stops;
}

export function calculateRouteScore(totalDistanceKm: number, traditionalDistanceKm: number): number {
  if (traditionalDistanceKm <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((1 - totalDistanceKm / traditionalDistanceKm) * 100)));
}

export function compareTraditionalRoute(totalDistanceKm: number, traditionalDistanceKm = 84) {
  const distanceReducedKm = Math.max(0, traditionalDistanceKm - totalDistanceKm);
  return {
    traditionalDistanceKm,
    distanceReducedKm,
    reductionPercent: Number(((distanceReducedKm / traditionalDistanceKm) * 100).toFixed(1)),
  };
}

export function generateRouteRecommendation(
  farmers: LogisticsFarmer[],
  collectionPoint: string,
  buyer: string
): RoutePlan {
  const stops = optimizeCollectionSequence(farmers, collectionPoint, buyer);
  const totalDistanceKm = calculateRouteDistance(stops);
  const comparison = compareTraditionalRoute(totalDistanceKm);
  return {
    stops,
    totalDistanceKm,
    routeScore: calculateRouteScore(totalDistanceKm, comparison.traditionalDistanceKm),
    recommendation: `Coordinate ${farmers.length} farmer pickups through ${collectionPoint} before delivery to ${buyer}.`,
    ...comparison,
  };
}