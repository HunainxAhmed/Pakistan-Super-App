import { GeoCoordinates } from '@superapp/types';
/**
 * Calculates the great-circle distance between two points using the Haversine formula.
 */
export declare function calculateHaversineDistanceKm(coord1: GeoCoordinates, coord2: GeoCoordinates): number;
/**
 * Computes forward azimuth/bearing in degrees (0-360) from coord1 to coord2.
 */
export declare function calculateBearing(coord1: GeoCoordinates, coord2: GeoCoordinates): number;
/**
 * Estimates travel duration in minutes based on distance and average urban traffic velocity.
 */
export declare function estimateDurationMinutes(distanceKm: number, averageSpeedKmh?: number): number;
/**
 * Linearly interpolates between two geo points. Useful for real-time marker animation.
 */
export declare function interpolatePosition(start: GeoCoordinates, end: GeoCoordinates, fraction: number): GeoCoordinates;
