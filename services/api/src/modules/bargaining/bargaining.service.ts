import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ServiceOffer, OfferStatus, ServiceRequestStatus, ServiceRequest } from '@superapp/types';

@Injectable()
export class BargainingService {
  constructor(private readonly db: DatabaseService) {}

  async getOffersForRequest(requestId: string): Promise<ServiceOffer[]> {
    const offers = this.db.offers.get(requestId) || [];
    return offers.filter((o) => o.status === OfferStatus.PENDING);
  }

  async submitOffer(dto: {
    serviceRequestId: string;
    providerId: string;
    offeredFare: number;
    etaMinutes: number;
    distanceKm: number;
  }): Promise<ServiceOffer> {
    const request = this.db.requests.get(dto.serviceRequestId);
    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    if (request.status !== ServiceRequestStatus.OFFERS_OPEN && request.status !== ServiceRequestStatus.MATCHING) {
      throw new BadRequestException('Request is no longer accepting offers');
    }

    const provider = this.db.providers.get(dto.providerId);
    const user = this.db.users.get(dto.providerId);

    const offerId = `offer-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newOffer: ServiceOffer = {
      id: offerId,
      serviceRequestId: dto.serviceRequestId,
      providerId: dto.providerId,
      providerName: user?.fullName || 'Verified Partner',
      providerRating: provider?.ratingAverage || 4.8,
      providerTotalJobs: provider?.totalCompletedJobs || 120,
      vehicleInfo: provider?.vehicle
        ? {
            model: `${provider.vehicle.make} ${provider.vehicle.model}`,
            registrationNumber: provider.vehicle.registrationNumber,
            color: provider.vehicle.color,
          }
        : undefined,
      offeredFare: dto.offeredFare,
      etaMinutes: dto.etaMinutes,
      distanceKm: dto.distanceKm,
      status: OfferStatus.PENDING,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 45000).toISOString(), // 45s validity
    };

    const existingOffers = this.db.offers.get(dto.serviceRequestId) || [];
    existingOffers.push(newOffer);
    this.db.offers.set(dto.serviceRequestId, existingOffers);

    return newOffer;
  }

  async acceptOffer(requestId: string, offerId: string): Promise<ServiceRequest> {
    const request = this.db.requests.get(requestId);
    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    if (request.status === ServiceRequestStatus.ACCEPTED) {
      throw new BadRequestException('Request has already been accepted by another provider');
    }

    const offers = this.db.offers.get(requestId) || [];
    const selectedOffer = offers.find((o) => o.id === offerId);
    if (!selectedOffer) {
      throw new NotFoundException('Offer not found');
    }

    // Atomic update
    selectedOffer.status = OfferStatus.ACCEPTED;
    for (const o of offers) {
      if (o.id !== offerId) {
        o.status = OfferStatus.REJECTED;
      }
    }

    request.status = ServiceRequestStatus.ACCEPTED;
    request.assignedProviderId = selectedOffer.providerId;
    request.assignedProviderName = selectedOffer.providerName;
    request.finalAgreedFare = selectedOffer.offeredFare;
    request.acceptedAt = new Date().toISOString();
    request.updatedAt = new Date().toISOString();

    return request;
  }
}
