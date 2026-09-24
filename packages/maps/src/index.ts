import { GeoCoordinates } from '@superapp/types';
import { calculateHaversineDistanceKm, calculateBearing, estimateDurationMinutes } from './haversine';
import { PAKISTANI_LANDMARKS, LocationLandmark } from './mock-karachi';

export * from './haversine';
export * from './mock-karachi';

export interface RouteCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  origin: GeoCoordinates;
  destination: GeoCoordinates;
  polyline: string;
}

export interface IMapService {
  searchPlaces(query: string): Promise<LocationLandmark[]>;
  reverseGeocode(coord: GeoCoordinates): Promise<string>;
  calculateRoute(origin: GeoCoordinates, destination: GeoCoordinates): Promise<RouteCalculationResult>;
}

export class MockMapService implements IMapService {
  async searchPlaces(query: string): Promise<LocationLandmark[]> {
    const q = query.toLowerCase().trim();
    if (!q) return PAKISTANI_LANDMARKS.slice(0, 10);
    const tokens = q.split(/[\s,.-]+/).filter((t) => t.length > 0);
    if (tokens.length === 0) return PAKISTANI_LANDMARKS.slice(0, 10);

    return PAKISTANI_LANDMARKS.filter((l) => {
      const full = `${l.name} ${l.address} ${l.city} ${l.category}`.toLowerCase();
      return tokens.every((token) => full.includes(token));
    });
  }

  async reverseGeocode(coord: GeoCoordinates): Promise<string> {
    // Find closest landmark
    let closest = PAKISTANI_LANDMARKS[0];
    let minDistance = calculateHaversineDistanceKm(coord, closest.coordinates);

    for (const lm of PAKISTANI_LANDMARKS) {
      const dist = calculateHaversineDistanceKm(coord, lm.coordinates);
      if (dist < minDistance) {
        minDistance = dist;
        closest = lm;
      }
    }

    if (minDistance <= 1.0) {
      return `Near ${closest.name}, ${closest.address}`;
    }
    return `Lat: ${coord.latitude.toFixed(4)}, Lng: ${coord.longitude.toFixed(4)}, Karachi`;
  }

  async calculateRoute(
    origin: GeoCoordinates,
    destination: GeoCoordinates
  ): Promise<RouteCalculationResult> {
    const distanceKm = calculateHaversineDistanceKm(origin, destination);
    const durationMinutes = estimateDurationMinutes(distanceKm);

    return {
      distanceKm,
      durationMinutes,
      origin,
      destination,
      polyline: `mock_polyline_${origin.latitude}_${destination.latitude}`,
    };
  }
}

export const defaultMapService: IMapService = new MockMapService();
