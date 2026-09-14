export enum ServiceCategorySlug {
  RIDE = 'RIDE',
  FOOD = 'FOOD',
  MECHANIC = 'MECHANIC',
  HOME_SERVICE = 'HOME_SERVICE',
}

export enum PricingModel {
  DISTANCE_TIME = 'DISTANCE_TIME',
  FIXED = 'FIXED',
  HOURLY = 'HOURLY',
  BARGAIN_INDRIVE = 'BARGAIN_INDRIVE',
  QUOTE_BASED = 'QUOTE_BASED',
}

export enum ServiceRequestStatus {
  REQUESTED = 'REQUESTED',
  MATCHING = 'MATCHING',
  OFFERS_OPEN = 'OFFERS_OPEN',
  ACCEPTED = 'ACCEPTED',
  PROVIDER_EN_ROUTE = 'PROVIDER_EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export interface ServiceType {
  id: string;
  categorySlug: ServiceCategorySlug;
  name: string; // e.g. "Bike", "AC Car", "Roadside Battery", "Plumber"
  slug: string;
  icon: string;
  pricingModel: PricingModel;
  baseFare: number; // in PKR
  perKmRate: number; // in PKR
  perMinuteRate: number; // in PKR
  minFare: number; // in PKR
  commissionPercentage: number; // e.g. 15 for 15%
  isActive: boolean;
}

export interface ServiceRequest {
  id: string;
  requestNumber: string; // e.g. "SR-2026-91823"
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
  
  customerOfferedFare?: number; // for bargaining mode
  suggestedFare?: number;
  finalAgreedFare?: number;
  surgeMultiplier: number;
  
  cancellationReason?: string;
  cancelledBy?: 'CUSTOMER' | 'PROVIDER' | 'SYSTEM' | 'ADMIN';
  
  driverArrivedAt?: string;
  tripStartedAt?: string;
  waitingOvertimeMinutes?: number;
  waitingPenaltyAmount?: number;
  
  metadata?: Record<string, any>;
  
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  completedAt?: string;
}
