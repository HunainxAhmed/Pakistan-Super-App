import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { VerificationStatus, ServiceRequestStatus } from '@superapp/types';

@Injectable()
export class AdminService {
  constructor(private readonly db: DatabaseService) {}

  async getOperationsOverview() {
    const totalUsers = this.db.users.size;
    const allProviders = Array.from(this.db.providers.values());
    const onlineProviders = allProviders.filter((p) => p.isOnline).length;
    const allRequests = Array.from(this.db.requests.values());

    const activeRides = allRequests.filter(
      (r) =>
        r.serviceType.categorySlug === 'RIDE' &&
        r.status !== ServiceRequestStatus.COMPLETED &&
        r.status !== ServiceRequestStatus.CANCELLED
    ).length;

    const activeAssistance = allRequests.filter(
      (r) =>
        (r.serviceType.categorySlug === 'MECHANIC' || r.serviceType.categorySlug === 'HOME_SERVICE') &&
        r.status !== ServiceRequestStatus.COMPLETED &&
        r.status !== ServiceRequestStatus.CANCELLED
    ).length;

    // Simulated GMV and commission calculations
    const completedRequests = allRequests.filter((r) => r.status === ServiceRequestStatus.COMPLETED);
    const todayGmv = completedRequests.reduce((sum, r) => sum + (r.finalAgreedFare || 0), 285400); // realistic base GMV
    const commission = Math.round(todayGmv * 0.15);

    return {
      metrics: {
        totalUsers,
        onlineProviders,
        activeRides,
        activeAssistance,
        todayGmv,
        todayCommission: commission,
        currency: 'PKR',
      },
      city: 'Karachi, Pakistan',
    };
  }

  async getLiveRadarProviders() {
    const providers = Array.from(this.db.providers.values()).filter((p) => p.isOnline);
    return providers.map((p) => {
      const u = this.db.users.get(p.id);
      return {
        id: p.id,
        name: u?.fullName || 'Partner',
        phone: u?.phoneNumber,
        categories: p.serviceCategories,
        latitude: p.currentLatitude || 24.814,
        longitude: p.currentLongitude || 67.031,
        bearing: p.currentBearing || 0,
        rating: p.ratingAverage,
        vehicle: p.vehicle,
        verificationStatus: p.verificationStatus,
      };
    });
  }

  async getAllRequests() {
    return Array.from(this.db.requests.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateProviderVerification(providerId: string, status: VerificationStatus) {
    const provider = this.db.providers.get(providerId);
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    provider.verificationStatus = status;
    return provider;
  }
}
