export declare enum ServiceCategorySlug {
    RIDE = "RIDE",
    FOOD = "FOOD",
    MECHANIC = "MECHANIC",
    HOME_SERVICE = "HOME_SERVICE"
}
export declare enum PricingModel {
    DISTANCE_TIME = "DISTANCE_TIME",
    FIXED = "FIXED",
    HOURLY = "HOURLY",
    BARGAIN_INDRIVE = "BARGAIN_INDRIVE",
    QUOTE_BASED = "QUOTE_BASED"
}
export declare enum ServiceRequestStatus {
    REQUESTED = "REQUESTED",
    MATCHING = "MATCHING",
    OFFERS_OPEN = "OFFERS_OPEN",
    ACCEPTED = "ACCEPTED",
    PROVIDER_EN_ROUTE = "PROVIDER_EN_ROUTE",
    ARRIVED = "ARRIVED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    DISPUTED = "DISPUTED"
}
export interface ServiceType {
    id: string;
    categorySlug: ServiceCategorySlug;
    name: string;
    slug: string;
    icon: string;
    pricingModel: PricingModel;
    baseFare: number;
    perKmRate: number;
    perMinuteRate: number;
    minFare: number;
    commissionPercentage: number;
    isActive: boolean;
}
export interface ServiceRequest {
    id: string;
    requestNumber: string;
    serviceTypeId: string;
    serviceType: ServiceType;
    customerId: string;
    customerName: string;
    customerPhone: string;
    assignedProviderId?: string;
    assignedProviderName?: string;
    assignedProviderPhone?: string;
    status: ServiceRequestStatus;
    pickupLatitude: number;
    pickupLongitude: number;
    pickupAddressText: string;
    dropoffLatitude?: number;
    dropoffLongitude?: number;
    dropoffAddressText?: string;
    estimatedDistanceKm?: number;
    estimatedDurationMinutes?: number;
    customerOfferedFare?: number;
    suggestedFare?: number;
    finalAgreedFare?: number;
    surgeMultiplier: number;
    cancellationReason?: string;
    cancelledBy?: 'CUSTOMER' | 'PROVIDER' | 'SYSTEM' | 'ADMIN';
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    acceptedAt?: string;
    completedAt?: string;
}
