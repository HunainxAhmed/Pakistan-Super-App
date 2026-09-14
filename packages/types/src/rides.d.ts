export declare enum VehicleCategory {
    BIKE = "BIKE",
    RICKSHAW = "RICKSHAW",
    CAR = "CAR",
    AC_CAR = "AC_CAR"
}
export interface RideFareBreakdown {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surgeMultiplier: number;
    surgeAmount: number;
    bookingFee: number;
    discountAmount: number;
    subtotal: number;
    totalFare: number;
    currency: 'PKR';
}
export interface VehicleEstimate {
    vehicleCategory: VehicleCategory;
    displayName: string;
    description: string;
    iconName: string;
    fareEstimate: RideFareBreakdown;
    estimatedEtaMinutes: number;
    isAvailable: boolean;
}
export interface RideRouteInfo {
    distanceKm: number;
    durationMinutes: number;
    polylinePoints: string;
    pickupAddress: string;
    dropoffAddress: string;
}
