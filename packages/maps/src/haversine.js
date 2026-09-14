"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateHaversineDistanceKm = calculateHaversineDistanceKm;
exports.calculateBearing = calculateBearing;
exports.estimateDurationMinutes = estimateDurationMinutes;
exports.interpolatePosition = interpolatePosition;
const EARTH_RADIUS_KM = 6371;
/**
 * Calculates the great-circle distance between two points using the Haversine formula.
 */
function calculateHaversineDistanceKm(coord1, coord2) {
    const dLat = degreesToRadians(coord2.latitude - coord1.latitude);
    const dLon = degreesToRadians(coord2.longitude - coord1.longitude);
    const lat1Rad = degreesToRadians(coord1.latitude);
    const lat2Rad = degreesToRadians(coord2.latitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightLineKm = EARTH_RADIUS_KM * c;
    // Urban road winding factor (detour index) in Pakistani cities typically adds ~25-30%
    const roadDetourFactor = 1.25;
    return Number((straightLineKm * roadDetourFactor).toFixed(2));
}
/**
 * Computes forward azimuth/bearing in degrees (0-360) from coord1 to coord2.
 */
function calculateBearing(coord1, coord2) {
    const lat1 = degreesToRadians(coord1.latitude);
    const lat2 = degreesToRadians(coord2.latitude);
    const dLon = degreesToRadians(coord2.longitude - coord1.longitude);
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const brng = (radiansToDegrees(Math.atan2(y, x)) + 360) % 360;
    return Number(brng.toFixed(1));
}
/**
 * Estimates travel duration in minutes based on distance and average urban traffic velocity.
 */
function estimateDurationMinutes(distanceKm, averageSpeedKmh = 25) {
    if (distanceKm <= 0)
        return 1;
    const hours = distanceKm / averageSpeedKmh;
    const minutes = Math.ceil(hours * 60);
    return Math.max(minutes, 2);
}
/**
 * Linearly interpolates between two geo points. Useful for real-time marker animation.
 */
function interpolatePosition(start, end, fraction) {
    const clampedFraction = Math.max(0, Math.min(1, fraction));
    return {
        latitude: Number((start.latitude + (end.latitude - start.latitude) * clampedFraction).toFixed(6)),
        longitude: Number((start.longitude + (end.longitude - start.longitude) * clampedFraction).toFixed(6)),
    };
}
function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
}
function radiansToDegrees(radians) {
    return (radians * 180) / Math.PI;
}
