"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultMapService = exports.MockMapService = void 0;
const haversine_1 = require("./haversine");
const mock_karachi_1 = require("./mock-karachi");
__exportStar(require("./haversine"), exports);
__exportStar(require("./mock-karachi"), exports);
class MockMapService {
    async searchPlaces(query) {
        const q = query.toLowerCase().trim();
        if (!q)
            return mock_karachi_1.PAKISTANI_LANDMARKS.slice(0, 5);
        return mock_karachi_1.PAKISTANI_LANDMARKS.filter((l) => l.name.toLowerCase().includes(q) ||
            l.address.toLowerCase().includes(q) ||
            l.city.toLowerCase().includes(q));
    }
    async reverseGeocode(coord) {
        // Find closest landmark
        let closest = mock_karachi_1.PAKISTANI_LANDMARKS[0];
        let minDistance = (0, haversine_1.calculateHaversineDistanceKm)(coord, closest.coordinates);
        for (const lm of mock_karachi_1.PAKISTANI_LANDMARKS) {
            const dist = (0, haversine_1.calculateHaversineDistanceKm)(coord, lm.coordinates);
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
    async calculateRoute(origin, destination) {
        const distanceKm = (0, haversine_1.calculateHaversineDistanceKm)(origin, destination);
        const durationMinutes = (0, haversine_1.estimateDurationMinutes)(distanceKm);
        return {
            distanceKm,
            durationMinutes,
            origin,
            destination,
            polyline: `mock_polyline_${origin.latitude}_${destination.latitude}`,
        };
    }
}
exports.MockMapService = MockMapService;
exports.defaultMapService = new MockMapService();
