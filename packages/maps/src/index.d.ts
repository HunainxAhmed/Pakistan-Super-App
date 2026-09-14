import { GeoCoordinates } from '@superapp/types';
import { LocationLandmark } from './mock-karachi';
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
export declare class MockMapService implements IMapService {
    searchPlaces(query: string): Promise<LocationLandmark[]>;
    reverseGeocode(coord: GeoCoordinates): Promise<string>;
    calculateRoute(origin: GeoCoordinates, destination: GeoCoordinates): Promise<RouteCalculationResult>;
}
export declare const defaultMapService: IMapService;
