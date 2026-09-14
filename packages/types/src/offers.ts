export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface ServiceOffer {
  id: string;
  serviceRequestId: string;
  providerId: string;
  providerName: string;
  providerRating: number;
  providerTotalJobs: number;
  providerPhotoUrl?: string;
  vehicleInfo?: {
    model: string;
    registrationNumber: string;
    color: string;
  };
  offeredFare: number; // in PKR
  etaMinutes: number;
  distanceKm: number;
  status: OfferStatus;
  createdAt: string;
  expiresAt: string;
}

export interface CreateOfferDto {
  serviceRequestId: string;
  providerId: string;
  offeredFare: number;
  etaMinutes: number;
  distanceKm: number;
}
