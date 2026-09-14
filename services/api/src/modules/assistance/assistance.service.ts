import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  MechanicProblemType,
  HomeServiceCategory,
  ServiceRequest,
  ServiceRequestStatus,
  ServiceCategorySlug,
  PricingModel,
  OfferStatus,
} from '@superapp/types';

@Injectable()
export class AssistanceService {
  constructor(private readonly db: DatabaseService) {}

  async createMechanicRequest(dto: {
    customerId: string;
    latitude: number;
    longitude: number;
    addressText: string;
    vehicleType: 'BIKE' | 'CAR' | 'COMMERCIAL';
    vehicleMake: string;
    vehicleModel: string;
    problemType: MechanicProblemType;
    description: string;
    customerOfferedFare?: number;
  }): Promise<ServiceRequest> {
    const customer = this.db.users.get(dto.customerId) || {
      id: dto.customerId,
      fullName: 'Customer',
      phoneNumber: '+923001234567',
    };

    const requestId = `req-mech-${Date.now()}`;
    const baseEstimatedFee = dto.problemType === MechanicProblemType.TOWING_SERVICE ? 2500 : 800;

    const newRequest: ServiceRequest = {
      id: requestId,
      requestNumber: `MECH-${Math.floor(10000 + Math.random() * 90000)}`,
      serviceTypeId: dto.problemType,
      serviceType: {
        id: dto.problemType,
        categorySlug: ServiceCategorySlug.MECHANIC,
        name: `Roadside: ${dto.problemType.replace('_', ' ')}`,
        slug: dto.problemType.toLowerCase(),
        icon: 'wrench',
        pricingModel: PricingModel.BARGAIN_INDRIVE,
        baseFare: baseEstimatedFee,
        perKmRate: 0,
        perMinuteRate: 0,
        minFare: 500,
        commissionPercentage: 10,
        isActive: true,
      },
      customerId: dto.customerId,
      customerName: customer.fullName,
      customerPhone: customer.phoneNumber,
      status: ServiceRequestStatus.OFFERS_OPEN,
      pickupLatitude: dto.latitude,
      pickupLongitude: dto.longitude,
      pickupAddressText: dto.addressText,
      suggestedFare: baseEstimatedFee,
      customerOfferedFare: dto.customerOfferedFare || baseEstimatedFee,
      finalAgreedFare: dto.customerOfferedFare || baseEstimatedFee,
      surgeMultiplier: 1.0,
      metadata: {
        vehicleType: dto.vehicleType,
        vehicleMake: dto.vehicleMake,
        vehicleModel: dto.vehicleModel,
        problemType: dto.problemType,
        description: dto.description,
      } as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.requests.set(requestId, newRequest);

    // Generate simulated mechanic offers
    const mechanicOffers = [
      {
        id: `offer-mech-1`,
        serviceRequestId: requestId,
        providerId: 'prov-mech-001',
        providerName: 'Ustad Jamil (Auto Electrician & Battery)',
        providerRating: 4.95,
        providerTotalJobs: 620,
        offeredFare: baseEstimatedFee,
        etaMinutes: 8,
        distanceKm: 1.8,
        status: OfferStatus.PENDING,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      },
      {
        id: `offer-mech-2`,
        serviceRequestId: requestId,
        providerId: 'prov-mech-002',
        providerName: 'Korangi Mobile Towing & Tire Service',
        providerRating: 4.88,
        providerTotalJobs: 410,
        offeredFare: baseEstimatedFee + 200,
        etaMinutes: 14,
        distanceKm: 3.4,
        status: OfferStatus.PENDING,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      },
    ];
    this.db.offers.set(requestId, mechanicOffers);

    return newRequest;
  }

  async createHomeServiceRequest(dto: {
    customerId: string;
    latitude: number;
    longitude: number;
    addressText: string;
    category: HomeServiceCategory;
    problemTitle: string;
    problemDescription: string;
    isEmergency?: boolean;
    preferredTimeSlot?: string;
  }): Promise<ServiceRequest> {
    const customer = this.db.users.get(dto.customerId) || {
      id: dto.customerId,
      fullName: 'Customer',
      phoneNumber: '+923001234567',
    };

    const requestId = `req-home-${Date.now()}`;
    const inspectionFee = dto.isEmergency ? 1200 : 700;

    const newRequest: ServiceRequest = {
      id: requestId,
      requestNumber: `HS-${Math.floor(10000 + Math.random() * 90000)}`,
      serviceTypeId: dto.category,
      serviceType: {
        id: dto.category,
        categorySlug: ServiceCategorySlug.HOME_SERVICE,
        name: `${dto.category.replace('_', ' ')} Service`,
        slug: dto.category.toLowerCase(),
        icon: 'hammer',
        pricingModel: PricingModel.QUOTE_BASED,
        baseFare: inspectionFee,
        perKmRate: 0,
        perMinuteRate: 0,
        minFare: 500,
        commissionPercentage: 12,
        isActive: true,
      },
      customerId: dto.customerId,
      customerName: customer.fullName,
      customerPhone: customer.phoneNumber,
      status: ServiceRequestStatus.REQUESTED,
      pickupLatitude: dto.latitude,
      pickupLongitude: dto.longitude,
      pickupAddressText: dto.addressText,
      suggestedFare: inspectionFee,
      finalAgreedFare: inspectionFee,
      surgeMultiplier: 1.0,
      metadata: {
        category: dto.category,
        problemTitle: dto.problemTitle,
        problemDescription: dto.problemDescription,
        isEmergency: dto.isEmergency || false,
        preferredTimeSlot: dto.preferredTimeSlot || 'ASAP',
      } as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.requests.set(requestId, newRequest);
    return newRequest;
  }
}
