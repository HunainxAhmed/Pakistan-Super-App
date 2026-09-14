import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
  User,
  UserRole,
  AccountStatus,
  VerificationStatus,
  ServiceCategorySlug,
  PricingModel,
  ServiceRequest,
  ServiceRequestStatus,
  ServiceOffer,
  OfferStatus,
  ProviderProfile,
  VehicleCategory,
  MechanicProblemType,
} from '@superapp/types';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  // In-memory data structures (safe development fallback)
  public users: Map<string, User> = new Map();
  public providers: Map<string, ProviderProfile> = new Map();
  public requests: Map<string, ServiceRequest> = new Map();
  public offers: Map<string, ServiceOffer[]> = new Map(); // requestId -> offers
  public wallets: Map<string, { balance: number; currency: string }> = new Map();

  onModuleInit() {
    this.seedDevelopmentData();
    this.logger.log('DatabaseService initialized with realistic Pakistani seed entities.');
  }

  private seedDevelopmentData() {
    // 1. Seed Demo Customer (Hunain)
    const customerId = 'cust-001';
    const customerUser: User = {
      id: customerId,
      phoneNumber: '+923001234567',
      email: 'hunain@example.com',
      fullName: 'Hunain Ahmed',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      roles: [UserRole.CUSTOMER],
      status: AccountStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(customerId, customerUser);
    this.wallets.set(customerId, { balance: 2500, currency: 'PKR' });

    // 2. Seed Demo Drivers (Karachi)
    const drivers = [
      {
        id: 'prov-driver-001',
        name: 'Tariq Mehmood',
        phone: '+923219876543',
        cnic: '42201-1234567-3',
        vehicle: {
          id: 'veh-001',
          providerId: 'prov-driver-001',
          type: 'CAR',
          make: 'Toyota',
          model: 'Corolla GLI',
          year: 2021,
          registrationNumber: 'KHI-9821',
          color: 'White',
          hasAirConditioning: true,
        },
        lat: 24.8145,
        lng: 67.0315, // near Clifton
        rating: 4.9,
        jobs: 342,
      },
      {
        id: 'prov-driver-002',
        name: 'Muhammad Asif',
        phone: '+923335551234',
        cnic: '42101-7654321-1',
        vehicle: {
          id: 'veh-002',
          providerId: 'prov-driver-002',
          type: 'BIKE',
          make: 'Honda',
          model: 'CD 70',
          year: 2023,
          registrationNumber: 'KHI-5541',
          color: 'Red',
          hasAirConditioning: false,
        },
        lat: 24.858,
        lng: 67.055, // near Shahrah-e-Faisal
        rating: 4.8,
        jobs: 820,
      },
      {
        id: 'prov-driver-003',
        name: 'Rashid Khan',
        phone: '+923458889999',
        cnic: '42301-4433221-5',
        vehicle: {
          id: 'veh-003',
          providerId: 'prov-driver-003',
          type: 'RICKSHAW',
          make: 'Sazgar',
          model: '4-Stroke CNG',
          year: 2022,
          registrationNumber: 'KHI-7712',
          color: 'Green & Yellow',
          hasAirConditioning: false,
        },
        lat: 24.919,
        lng: 67.098, // Gulshan-e-Iqbal
        rating: 4.7,
        jobs: 512,
      },
    ];

    for (const d of drivers) {
      const u: User = {
        id: d.id,
        phoneNumber: d.phone,
        fullName: d.name,
        roles: [UserRole.PROVIDER, UserRole.DRIVER],
        status: AccountStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.users.set(d.id, u);

      const p: ProviderProfile = {
        id: d.id,
        userId: d.id,
        nationalIdNumber: d.cnic,
        verificationStatus: VerificationStatus.APPROVED,
        serviceCategories: ['RIDE'],
        isOnline: true,
        ratingAverage: d.rating,
        totalRatings: d.jobs,
        totalCompletedJobs: d.jobs,
        acceptanceRate: 94,
        cancellationRate: 2,
        currentLatitude: d.lat,
        currentLongitude: d.lng,
        currentBearing: 45,
        vehicle: d.vehicle,
      };
      this.providers.set(d.id, p);
      this.wallets.set(d.id, { balance: 4800, currency: 'PKR' });
    }

    // 3. Seed Demo Roadside Mechanics (Karachi)
    const mechanics = [
      {
        id: 'prov-mech-001',
        name: 'Ustad Jamil (Auto Electrician & Battery)',
        phone: '+923004443322',
        cnic: '42201-9988776-1',
        lat: 24.815,
        lng: 67.032,
        rating: 4.95,
        jobs: 620,
      },
      {
        id: 'prov-mech-002',
        name: 'Korangi Mobile Towing & Tire Service',
        phone: '+923126667788',
        cnic: '42101-5544332-9',
        lat: 24.857,
        lng: 67.054,
        rating: 4.88,
        jobs: 410,
      },
    ];

    for (const m of mechanics) {
      const u: User = {
        id: m.id,
        phoneNumber: m.phone,
        fullName: m.name,
        roles: [UserRole.PROVIDER, UserRole.MECHANIC],
        status: AccountStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.users.set(m.id, u);

      const p: ProviderProfile = {
        id: m.id,
        userId: m.id,
        nationalIdNumber: m.cnic,
        verificationStatus: VerificationStatus.APPROVED,
        serviceCategories: ['MECHANIC'],
        isOnline: true,
        ratingAverage: m.rating,
        totalRatings: m.jobs,
        totalCompletedJobs: m.jobs,
        acceptanceRate: 98,
        cancellationRate: 1,
        currentLatitude: m.lat,
        currentLongitude: m.lng,
      };
      this.providers.set(m.id, p);
      this.wallets.set(m.id, { balance: 12000, currency: 'PKR' });
    }
  }
}
