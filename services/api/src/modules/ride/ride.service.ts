import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { calculateHaversineDistanceKm, estimateDurationMinutes } from '@superapp/maps';
import {
  VehicleCategory,
  VehicleEstimate,
  RideFareBreakdown,
  ServiceRequest,
  ServiceRequestStatus,
  ServiceCategorySlug,
  PricingModel,
  OfferStatus,
} from '@superapp/types';

@Injectable()
export class RideService {
  constructor(private readonly db: DatabaseService) {}

  calculateFareBreakdown(
    vehicle: VehicleCategory,
    distanceKm: number,
    durationMinutes: number,
    surgeMultiplier: number = 1.0
  ): RideFareBreakdown {
    const pricingConfig = {
      [VehicleCategory.BIKE]: { base: 80, perKm: 22, perMin: 3, minFare: 100, bookingFee: 15 },
      [VehicleCategory.RICKSHAW]: { base: 120, perKm: 28, perMin: 4, minFare: 150, bookingFee: 20 },
      [VehicleCategory.CAR]: { base: 180, perKm: 42, perMin: 6, minFare: 220, bookingFee: 25 },
      [VehicleCategory.AC_CAR]: { base: 220, perKm: 52, perMin: 7, minFare: 280, bookingFee: 30 },
    }[vehicle];

    const distanceFare = Number((distanceKm * pricingConfig.perKm).toFixed(2));
    const timeFare = Number((durationMinutes * pricingConfig.perMin).toFixed(2));
    const rawSubtotal = pricingConfig.base + distanceFare + timeFare;

    const surgeAmount = Number((rawSubtotal * (surgeMultiplier - 1.0)).toFixed(2));
    const subtotalWithSurge = rawSubtotal + surgeAmount;
    const finalFare = Math.max(pricingConfig.minFare, subtotalWithSurge + pricingConfig.bookingFee);

    return {
      baseFare: pricingConfig.base,
      distanceFare,
      timeFare,
      surgeMultiplier,
      surgeAmount,
      bookingFee: pricingConfig.bookingFee,
      discountAmount: 0,
      subtotal: rawSubtotal,
      totalFare: Math.round(finalFare),
      currency: 'PKR',
    };
  }

  async getVehicleEstimates(
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number
  ): Promise<{
    distanceKm: number;
    durationMinutes: number;
    estimates: VehicleEstimate[];
  }> {
    const distanceKm = calculateHaversineDistanceKm(
      { latitude: pickupLat, longitude: pickupLng },
      { latitude: dropoffLat, longitude: dropoffLng }
    );
    const durationMinutes = estimateDurationMinutes(distanceKm);
    const surge = 1.0; // Dynamic surge can be updated via admin rules

    const vehicleConfigs = [
      {
        category: VehicleCategory.BIKE,
        name: 'Super Bike',
        desc: 'Fastest through Karachi traffic, helmet provided',
        icon: 'motorbike',
      },
      {
        category: VehicleCategory.RICKSHAW,
        name: 'Super Rickshaw',
        desc: 'Affordable everyday local 3-wheeler',
        icon: 'rickshaw',
      },
      {
        category: VehicleCategory.CAR,
        name: 'Super Car Eco',
        desc: 'Comfortable 4-seater (Alto, WagonR)',
        icon: 'car-side',
      },
      {
        category: VehicleCategory.AC_CAR,
        name: 'Super AC Premium',
        desc: 'Guaranteed cold AC (Corolla, Yaris, City)',
        icon: 'snowflake',
      },
    ];

    const estimates: VehicleEstimate[] = vehicleConfigs.map((cfg) => ({
      vehicleCategory: cfg.category,
      displayName: cfg.name,
      description: cfg.desc,
      iconName: cfg.icon,
      fareEstimate: this.calculateFareBreakdown(cfg.category, distanceKm, durationMinutes, surge),
      estimatedEtaMinutes: cfg.category === VehicleCategory.BIKE ? 3 : 5,
      isAvailable: true,
    }));

    return {
      distanceKm,
      durationMinutes,
      estimates,
    };
  }

  async createRideRequest(dto: {
    customerId: string;
    pickupLatitude: number;
    pickupLongitude: number;
    pickupAddressText: string;
    dropoffLatitude: number;
    dropoffLongitude: number;
    dropoffAddressText: string;
    vehicleCategory: VehicleCategory;
    customerOfferedFare?: number;
  }): Promise<ServiceRequest> {
    const customer = this.db.users.get(dto.customerId) || {
      id: dto.customerId,
      fullName: 'Customer',
      phoneNumber: '+923001234567',
    };

    const distanceKm = calculateHaversineDistanceKm(
      { latitude: dto.pickupLatitude, longitude: dto.pickupLongitude },
      { latitude: dto.dropoffLatitude, longitude: dto.dropoffLongitude }
    );
    const durationMinutes = estimateDurationMinutes(distanceKm);
    const breakdown = this.calculateFareBreakdown(dto.vehicleCategory, distanceKm, durationMinutes);

    const requestId = `req-ride-${Date.now()}`;
    const requestNumber = `PK-${Math.floor(100000 + Math.random() * 900000)}`;

    const newRequest: ServiceRequest = {
      id: requestId,
      requestNumber,
      serviceTypeId: dto.vehicleCategory,
      serviceType: {
        id: dto.vehicleCategory,
        categorySlug: ServiceCategorySlug.RIDE,
        name: dto.vehicleCategory,
        slug: dto.vehicleCategory.toLowerCase(),
        icon: 'car',
        pricingModel: PricingModel.BARGAIN_INDRIVE,
        baseFare: breakdown.baseFare,
        perKmRate: breakdown.distanceFare / (distanceKm || 1),
        perMinuteRate: 5,
        minFare: 100,
        commissionPercentage: 15,
        isActive: true,
      },
      customerId: dto.customerId,
      customerName: customer.fullName,
      customerPhone: customer.phoneNumber,
      status: ServiceRequestStatus.OFFERS_OPEN,
      pickupLatitude: dto.pickupLatitude,
      pickupLongitude: dto.pickupLongitude,
      pickupAddressText: dto.pickupAddressText,
      dropoffLatitude: dto.dropoffLatitude,
      dropoffLongitude: dto.dropoffLongitude,
      dropoffAddressText: dto.dropoffAddressText,
      estimatedDistanceKm: distanceKm,
      estimatedDurationMinutes: durationMinutes,
      suggestedFare: breakdown.totalFare,
      customerOfferedFare: dto.customerOfferedFare || breakdown.totalFare,
      finalAgreedFare: dto.customerOfferedFare || breakdown.totalFare,
      surgeMultiplier: breakdown.surgeMultiplier,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.requests.set(requestId, newRequest);
    this.db.offers.set(requestId, []);

    // Auto-generate realistic initial driver counter-offers in dev mode so the user can test the bargaining UI immediately!
    this.spawnSimulatedDriverOffers(requestId, newRequest.suggestedFare || 400);

    return newRequest;
  }

  private spawnSimulatedDriverOffers(requestId: string, suggestedFare: number) {
    const driverPool = Array.from(this.db.providers.values()).slice(0, 3);
    const simulatedOffers = driverPool.map((driver, index) => {
      const delta = (index - 1) * 30; // -30, 0, +30 PKR difference
      return {
        id: `offer-${Date.now()}-${index}`,
        serviceRequestId: requestId,
        providerId: driver.id,
        providerName: this.db.users.get(driver.id)?.fullName || 'Verified Driver',
        providerRating: driver.ratingAverage,
        providerTotalJobs: driver.totalCompletedJobs,
        vehicleInfo: driver.vehicle
          ? {
              model: `${driver.vehicle.make} ${driver.vehicle.model}`,
              registrationNumber: driver.vehicle.registrationNumber,
              color: driver.vehicle.color,
            }
          : undefined,
        offeredFare: Math.max(100, suggestedFare + delta),
        etaMinutes: 3 + index * 2,
        distanceKm: Number((1.2 + index * 0.8).toFixed(1)),
        status: OfferStatus.PENDING,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      };
    });

    this.db.offers.set(requestId, simulatedOffers);
  }

  async getRequestById(requestId: string): Promise<ServiceRequest> {
    const request = this.db.requests.get(requestId);
    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }
    return request;
  }

  async cancelRequest(requestId: string, reason: string): Promise<ServiceRequest> {
    const request = await this.getRequestById(requestId);
    request.status = ServiceRequestStatus.CANCELLED;
    request.cancellationReason = reason;
    request.cancelledBy = 'CUSTOMER';
    request.updatedAt = new Date().toISOString();
    return request;
  }
}
