import { create } from 'zustand';
import {
  User,
  UserRole,
  ServiceRequest,
  ServiceOffer,
  VehicleCategory,
  MechanicProblemType,
  ServiceRequestStatus,
  OfferStatus,
  DriverProfileDetail,
  DriverReview,
} from '@superapp/types';

interface AppState {
  // Mode Switcher (Customer vs Provider)
  userRoleMode: 'CUSTOMER' | 'PROVIDER';
  currentUser: User;
  walletBalance: number;

  // Driver Profiles & Community Ratings
  driverProfiles: Record<string, DriverProfileDetail>;

  // Active Customer Ride State
  pickupLocation: { name: string; latitude: number; longitude: number };
  dropoffLocation: { name: string; latitude: number; longitude: number };
  selectedVehicle: VehicleCategory;
  activeRide: ServiceRequest | null;
  activeOffers: ServiceOffer[];
  waitingPenaltyAmount: number;
  waitingOvertimeSeconds: number;

  // Active Roadside Mechanic State
  activeMechanic: ServiceRequest | null;
  mechanicOffers: ServiceOffer[];

  // Provider State
  isProviderOnline: boolean;
  providerTodayEarnings: number;
  providerCompletedJobsCount: number;
  incomingRequestsFeed: ServiceRequest[];
  providerStep: 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';
  providerRideHistory: ProviderRideHistoryItem[];

  // Actions
  toggleRoleMode: () => void;
  setPickup: (name: string, lat: number, lng: number) => void;
  setDropoff: (name: string, lat: number, lng: number) => void;
  setSelectedVehicle: (vehicle: VehicleCategory) => void;
  createRideRequest: (offeredFare?: number) => void;
  acceptOffer: (
    offerId: string,
    bidDetails?: { providerId?: string; providerName?: string; offeredFare?: number }
  ) => void;
  declineOffer: (offerId: string) => void;
  updateCustomerOfferedFare: (fare: number) => void;
  addDriverOffer: (offer: ServiceOffer) => void;
  cancelActiveRide: () => void;
  setDriverArrived: () => void;
  startTrip: () => void;
  updateWaitingPenalty: (penalty: number, overtimeSecs: number) => void;
  submitDriverReview: (
    driverId: string,
    rating: number,
    comment?: string,
    tags?: string[]
  ) => void;
  createMechanicRequest: (problem: MechanicProblemType, desc: string, offeredFare?: number) => void;
  acceptMechanicOffer: (offerId: string) => void;
  toggleProviderOnline: () => void;
  setProviderStep: (step: 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED') => void;
  providerSendOffer: (requestId: string, fare: number) => void;
  providerAcceptJob: (request: ServiceRequest, agreedFare?: number) => void;
  providerDeclineJob: (requestId: string) => void;
  providerCompleteJob: (requestId: string, collectedFare?: number) => void;
  providerWithdrawFunds: (amount: number, method: string, accountDetails: string) => boolean;
}

export interface ProviderRideHistoryItem {
  id: string;
  customerName: string;
  pickup: string;
  dropoff: string;
  fare: number;
  commission: number;
  netEarning: number;
  completedAt: string;
}

const INITIAL_DRIVER_PROFILES: Record<string, DriverProfileDetail> = {
  'prov-driver-001': {
    id: 'prov-driver-001',
    name: 'Tariq Mehmood',
    phone: '+92 301 2345678',
    ratingAverage: 4.9,
    totalRatings: 312,
    totalTrips: 342,
    memberSince: 'March 2023',
    cnicVerified: true,
    drivingLicenseVerified: true,
    vehicle: {
      model: 'Toyota Corolla GLI',
      plate: 'KHI-9821',
      color: 'White',
      year: 2021,
      hasAirConditioning: true,
    },
    badges: ['Top Rated Partner', 'Chilled AC Guaranteed', 'Safe Driver', '300+ Trips'],
    reviews: [
      {
        id: 'rev-001',
        driverId: 'prov-driver-001',
        customerName: 'Ayesha Siddiqui',
        rating: 5,
        comment: 'MashAllah extremely polite driver and super clean car. AC was chilling during peak afternoon heat on Shahrah-e-Faisal.',
        tags: ['Clean Car', 'Ice Cold AC', 'Safe Driving'],
        createdAt: '2 days ago',
      },
      {
        id: 'rev-002',
        driverId: 'prov-driver-001',
        customerName: 'Farhan Ali',
        rating: 5,
        comment: 'Reached pick up location at Dolmen Mall in 3 mins. Followed the quickest route and drove very safely.',
        tags: ['On-Time Pickup', 'Great Navigation', 'Polite'],
        createdAt: '1 week ago',
      },
      {
        id: 'rev-003',
        driverId: 'prov-driver-001',
        customerName: 'Zainab Bibi',
        rating: 4,
        comment: 'Smooth ride and courteous behavior. Would definitely ride again.',
        tags: ['Polite', 'Safe Driving'],
        createdAt: '2 weeks ago',
      },
    ],
  },
  'prov-driver-002': {
    id: 'prov-driver-002',
    name: 'Muhammad Asif',
    phone: '+92 321 8765432',
    ratingAverage: 4.8,
    totalRatings: 780,
    totalTrips: 820,
    memberSince: 'August 2022',
    cnicVerified: true,
    drivingLicenseVerified: true,
    vehicle: {
      model: 'Suzuki Alto VXR',
      plate: 'KHI-5541',
      color: 'Silver',
      year: 2022,
      hasAirConditioning: true,
    },
    badges: ['Super Veteran (800+ Trips)', 'Budget Friendly', 'Quick Dispatch'],
    reviews: [
      {
        id: 'rev-101',
        driverId: 'prov-driver-002',
        customerName: 'Bilal Khan',
        rating: 5,
        comment: 'Very punctual and fair bargain fare. Fast navigation through Saddar traffic.',
        tags: ['Great Navigation', 'On-Time Pickup'],
        createdAt: 'Yesterday',
      },
      {
        id: 'rev-102',
        driverId: 'prov-driver-002',
        customerName: 'Sara Ahmed',
        rating: 4,
        comment: 'Good overall trip. AC was functioning well.',
        tags: ['Ice Cold AC', 'Clean Car'],
        createdAt: '3 days ago',
      },
    ],
  },
  'prov-driver-003': {
    id: 'prov-driver-003',
    name: 'Kamran Khan',
    phone: '+92 333 4567890',
    ratingAverage: 4.9,
    totalRatings: 480,
    totalTrips: 510,
    memberSince: 'January 2023',
    cnicVerified: true,
    drivingLicenseVerified: true,
    vehicle: {
      model: 'Honda City 1.5',
      plate: 'KHI-3209',
      color: 'Grey',
      year: 2023,
      hasAirConditioning: true,
    },
    badges: ['Top Rated Partner', 'Executive Ride', 'Chilled AC Guaranteed'],
    reviews: [
      {
        id: 'rev-201',
        driverId: 'prov-driver-003',
        customerName: 'Usman Ghani',
        rating: 5,
        comment: 'Honda City was brand new and spotless clean. Drove with utmost care.',
        tags: ['Clean Car', 'Safe Driving', 'Ice Cold AC'],
        createdAt: '3 days ago',
      },
      {
        id: 'rev-202',
        driverId: 'prov-driver-003',
        customerName: 'Maryam Noor',
        rating: 5,
        comment: 'Very respectful captain. Offered bottled water and drove smoothly on Clifton road.',
        tags: ['Polite', 'Clean Car'],
        createdAt: '1 week ago',
      },
    ],
  },
};

const INITIAL_INCOMING_REQUESTS: ServiceRequest[] = [
  {
    id: 'req-live-101',
    requestNumber: 'PK-829104',
    serviceTypeId: VehicleCategory.AC_CAR,
    serviceType: {
      id: VehicleCategory.AC_CAR,
      categorySlug: 'RIDE' as any,
      name: 'Super AC Premium',
      slug: 'ac_car',
      icon: 'car',
      pricingModel: 'BARGAIN_INDRIVE' as any,
      baseFare: 150,
      perKmRate: 40,
      perMinuteRate: 5,
      minFare: 200,
      commissionPercentage: 15,
      isActive: true,
    },
    customerId: 'cust-101',
    customerName: 'Sara Qureshi',
    customerPhone: '+92 300 1234567',
    status: ServiceRequestStatus.OFFERS_OPEN,
    pickupLatitude: 24.8138,
    pickupLongitude: 67.0305,
    pickupAddressText: 'Dolmen Mall Clifton, Gate 2, Karachi',
    dropoffLatitude: 24.8568,
    dropoffLongitude: 67.0544,
    dropoffAddressText: 'FTC Building Shahrah-e-Faisal, Karachi',
    estimatedDistanceKm: 5.2,
    estimatedDurationMinutes: 16,
    suggestedFare: 450,
    customerOfferedFare: 420,
    finalAgreedFare: 420,
    surgeMultiplier: 1.0,
    createdAt: new Date(Date.now() - 60000).toISOString(),
    updatedAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'req-live-102',
    requestNumber: 'PK-492015',
    serviceTypeId: VehicleCategory.CAR,
    serviceType: {
      id: VehicleCategory.CAR,
      categorySlug: 'RIDE' as any,
      name: 'Ride Mini (Alto/Mehran)',
      slug: 'car',
      icon: 'car-side',
      pricingModel: 'BARGAIN_INDRIVE' as any,
      baseFare: 100,
      perKmRate: 30,
      perMinuteRate: 4,
      minFare: 150,
      commissionPercentage: 15,
      isActive: true,
    },
    customerId: 'cust-102',
    customerName: 'Zubair Ahmed',
    customerPhone: '+92 321 9876543',
    status: ServiceRequestStatus.OFFERS_OPEN,
    pickupLatitude: 24.9388,
    pickupLongitude: 67.0869,
    pickupAddressText: 'Lucky One Mall, Main Rashid Minhas Rd, FB Area',
    dropoffLatitude: 24.9362,
    dropoffLongitude: 67.0425,
    dropoffAddressText: 'Five Star Chowrangi, North Nazimabad, Karachi',
    estimatedDistanceKm: 4.6,
    estimatedDurationMinutes: 14,
    suggestedFare: 360,
    customerOfferedFare: 330,
    finalAgreedFare: 330,
    surgeMultiplier: 1.0,
    createdAt: new Date(Date.now() - 120000).toISOString(),
    updatedAt: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'req-live-103',
    requestNumber: 'PK-716492',
    serviceTypeId: VehicleCategory.AC_CAR,
    serviceType: {
      id: VehicleCategory.AC_CAR,
      categorySlug: 'RIDE' as any,
      name: 'Super AC Premium',
      slug: 'ac_car',
      icon: 'car',
      pricingModel: 'BARGAIN_INDRIVE' as any,
      baseFare: 150,
      perKmRate: 40,
      perMinuteRate: 5,
      minFare: 200,
      commissionPercentage: 15,
      isActive: true,
    },
    customerId: 'cust-103',
    customerName: 'Dr. Mansoor Al-Karim',
    customerPhone: '+92 333 5556677',
    status: ServiceRequestStatus.OFFERS_OPEN,
    pickupLatitude: 24.9065,
    pickupLongitude: 67.1608,
    pickupAddressText: 'Jinnah International Airport, Terminal 1',
    dropoffLatitude: 24.7938,
    dropoffLongitude: 67.0674,
    dropoffAddressText: 'DHA Phase 6 Commercial, Khayaban-e-Shahbaz',
    estimatedDistanceKm: 16.8,
    estimatedDurationMinutes: 32,
    suggestedFare: 900,
    customerOfferedFare: 850,
    finalAgreedFare: 850,
    surgeMultiplier: 1.15,
    createdAt: new Date(Date.now() - 180000).toISOString(),
    updatedAt: new Date(Date.now() - 180000).toISOString(),
  },
];

const INITIAL_PROVIDER_RIDE_HISTORY: ProviderRideHistoryItem[] = [
  {
    id: 'hist-1',
    customerName: 'Bilal Khan',
    pickup: 'Saddar Electronics Market, Karachi',
    dropoff: 'Bahadurabad Char Minar Chowrangi',
    fare: 380,
    commission: 57,
    netEarning: 323,
    completedAt: 'Today, 2:30 PM',
  },
  {
    id: 'hist-2',
    customerName: 'Ayesha Siddiqui',
    pickup: 'Dolmen Mall Clifton, Karachi',
    dropoff: 'Burns Road Food Street, Karachi',
    fare: 450,
    commission: 67,
    netEarning: 383,
    completedAt: 'Today, 1:15 PM',
  },
  {
    id: 'hist-3',
    customerName: 'Farhan Ali',
    pickup: 'IBA Main Campus University Road',
    dropoff: 'NIPA Chowrangi, Gulshan-e-Iqbal',
    fare: 280,
    commission: 42,
    netEarning: 238,
    completedAt: 'Today, 11:45 AM',
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  userRoleMode: 'CUSTOMER',
  currentUser: {
    id: 'cust-001',
    phoneNumber: '+923001234567',
    fullName: 'Hunain Ahmed',
    roles: [UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.DRIVER],
    status: 'ACTIVE' as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  walletBalance: 2500,

  // Driver Profiles & Ratings
  driverProfiles: INITIAL_DRIVER_PROFILES,

  // Default Karachi landmarks
  pickupLocation: {
    name: 'Dolmen Mall Clifton, Karachi',
    latitude: 24.8138,
    longitude: 67.0305,
  },
  dropoffLocation: {
    name: 'FTC Building Shahrah-e-Faisal, Karachi',
    latitude: 24.8568,
    longitude: 67.0544,
  },
  selectedVehicle: VehicleCategory.AC_CAR,
  activeRide: null,
  activeOffers: [],
  waitingPenaltyAmount: 0,
  waitingOvertimeSeconds: 0,

  activeMechanic: null,
  mechanicOffers: [],

  isProviderOnline: true,
  providerTodayEarnings: 3850,
  providerCompletedJobsCount: 5,
  incomingRequestsFeed: INITIAL_INCOMING_REQUESTS,
  providerStep: 'EN_ROUTE',
  providerRideHistory: INITIAL_PROVIDER_RIDE_HISTORY,

  toggleRoleMode: () =>
    set((state) => ({
      userRoleMode: state.userRoleMode === 'CUSTOMER' ? 'PROVIDER' : 'CUSTOMER',
    })),

  setPickup: (name, latitude, longitude) =>
    set({ pickupLocation: { name, latitude, longitude } }),

  setDropoff: (name, latitude, longitude) =>
    set({ dropoffLocation: { name, latitude, longitude } }),

  setSelectedVehicle: (selectedVehicle) => set({ selectedVehicle }),

  createRideRequest: (offeredFare) => {
    const { pickupLocation, dropoffLocation, selectedVehicle, currentUser } = get();
    const requestId = `ride-${Date.now()}`;
    const suggested = selectedVehicle === VehicleCategory.BIKE ? 180 : 420;
    const finalFare = offeredFare || suggested;

    const newRide: ServiceRequest = {
      id: requestId,
      requestNumber: `PK-${Math.floor(100000 + Math.random() * 900000)}`,
      serviceTypeId: selectedVehicle,
      serviceType: {
        id: selectedVehicle,
        categorySlug: 'RIDE' as any,
        name: selectedVehicle,
        slug: selectedVehicle.toLowerCase(),
        icon: 'car',
        pricingModel: 'BARGAIN_INDRIVE' as any,
        baseFare: 120,
        perKmRate: 35,
        perMinuteRate: 5,
        minFare: 150,
        commissionPercentage: 15,
        isActive: true,
      },
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      customerPhone: currentUser.phoneNumber,
      status: ServiceRequestStatus.OFFERS_OPEN,
      pickupLatitude: pickupLocation.latitude,
      pickupLongitude: pickupLocation.longitude,
      pickupAddressText: pickupLocation.name,
      dropoffLatitude: dropoffLocation.latitude,
      dropoffLongitude: dropoffLocation.longitude,
      dropoffAddressText: dropoffLocation.name,
      estimatedDistanceKm: 5.2,
      estimatedDurationMinutes: 16,
      suggestedFare: suggested,
      customerOfferedFare: finalFare,
      finalAgreedFare: finalFare,
      surgeMultiplier: 1.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Realistic simulated inDrive driver offers
    const simulatedOffers: ServiceOffer[] = [
      {
        id: 'off-1',
        serviceRequestId: requestId,
        providerId: 'prov-driver-001',
        providerName: 'Tariq Mehmood',
        providerRating: 4.9,
        providerTotalJobs: 342,
        vehicleInfo: {
          model: 'Toyota Corolla GLI',
          registrationNumber: 'KHI-9821',
          color: 'White',
        },
        offeredFare: finalFare,
        etaMinutes: 4,
        distanceKm: 1.4,
        status: OfferStatus.PENDING,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 45000).toISOString(),
      },
      {
        id: 'off-2',
        serviceRequestId: requestId,
        providerId: 'prov-driver-002',
        providerName: 'Muhammad Asif',
        providerRating: 4.8,
        providerTotalJobs: 820,
        vehicleInfo: {
          model: 'Suzuki Alto VXR',
          registrationNumber: 'KHI-5541',
          color: 'Silver',
        },
        offeredFare: finalFare - 30,
        etaMinutes: 7,
        distanceKm: 2.1,
        status: OfferStatus.PENDING,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 45000).toISOString(),
      },
    ];

    set({
      activeRide: newRide,
      activeOffers: simulatedOffers,
      incomingRequestsFeed: [newRide],
    });
  },

  acceptOffer: (offerId, bidDetails) => {
    const { activeRide, activeOffers } = get();
    if (!activeRide) return;

    const selectedOffer = activeOffers.find((o) => o.id === offerId);
    const providerName =
      bidDetails?.providerName ||
      selectedOffer?.providerName ||
      (offerId.includes('asif')
        ? 'Muhammad Asif'
        : offerId.includes('kamran')
        ? 'Kamran Khan'
        : 'Tariq Mehmood');
    const finalFare =
      bidDetails?.offeredFare ||
      selectedOffer?.offeredFare ||
      activeRide.customerOfferedFare ||
      450;

    const updatedRide: ServiceRequest = {
      ...activeRide,
      status: ServiceRequestStatus.ACCEPTED,
      assignedProviderId:
        bidDetails?.providerId || selectedOffer?.providerId || 'prov-driver-001',
      assignedProviderName: providerName,
      assignedProviderPhone: '+923219876543',
      finalAgreedFare: finalFare,
      customerOfferedFare: finalFare,
      acceptedAt: new Date().toISOString(),
    };

    set({
      activeRide: updatedRide,
      activeOffers: [],
      waitingPenaltyAmount: 0,
      waitingOvertimeSeconds: 0,
    });
  },

  declineOffer: (offerId: string) => {
    const { activeOffers } = get();
    set({
      activeOffers: activeOffers.filter((o) => o.id !== offerId),
    });
  },

  updateCustomerOfferedFare: (fare: number) => {
    const { activeRide } = get();
    if (!activeRide) return;
    set({
      activeRide: {
        ...activeRide,
        customerOfferedFare: fare,
      },
    });
  },

  addDriverOffer: (offer: ServiceOffer) => {
    const { activeOffers } = get();
    // Replace if same driver or add
    const existingIndex = activeOffers.findIndex(
      (o) => o.id === offer.id || o.providerId === offer.providerId
    );
    if (existingIndex >= 0) {
      const updated = [...activeOffers];
      updated[existingIndex] = offer;
      set({ activeOffers: updated });
    } else {
      set({ activeOffers: [offer, ...activeOffers] });
    }
  },

  cancelActiveRide: () => {
    set({
      activeRide: null,
      activeOffers: [],
      waitingPenaltyAmount: 0,
      waitingOvertimeSeconds: 0,
    });
  },

  setDriverArrived: () => {
    const { activeRide } = get();
    if (!activeRide) return;
    set({
      activeRide: {
        ...activeRide,
        status: ServiceRequestStatus.ARRIVED,
        driverArrivedAt: new Date().toISOString(),
      },
    });
  },

  startTrip: () => {
    const { activeRide, waitingPenaltyAmount, waitingOvertimeSeconds } = get();
    if (!activeRide) return;
    const baseFare = activeRide.finalAgreedFare || 450;
    set({
      activeRide: {
        ...activeRide,
        status: ServiceRequestStatus.IN_PROGRESS,
        tripStartedAt: new Date().toISOString(),
        waitingPenaltyAmount,
        waitingOvertimeMinutes: Math.ceil(waitingOvertimeSeconds / 60),
        finalAgreedFare: baseFare + waitingPenaltyAmount,
      },
    });
  },

  updateWaitingPenalty: (penalty: number, overtimeSecs: number) => {
    const { activeRide } = get();
    set({
      waitingPenaltyAmount: penalty,
      waitingOvertimeSeconds: overtimeSecs,
      activeRide: activeRide
        ? {
            ...activeRide,
            waitingPenaltyAmount: penalty,
            waitingOvertimeMinutes: Math.ceil(overtimeSecs / 60),
          }
        : null,
    });
  },

  createMechanicRequest: (problemType, description, offeredFare) => {
    const { pickupLocation, currentUser } = get();
    const requestId = `mech-${Date.now()}`;
    const suggested = problemType === MechanicProblemType.TOWING_SERVICE ? 2500 : 900;
    const finalFare = offeredFare || suggested;

    const newRequest: ServiceRequest = {
      id: requestId,
      requestNumber: `MECH-${Math.floor(10000 + Math.random() * 90000)}`,
      serviceTypeId: problemType,
      serviceType: {
        id: problemType,
        categorySlug: 'MECHANIC' as any,
        name: `Roadside: ${problemType.replace('_', ' ')}`,
        slug: problemType.toLowerCase(),
        icon: 'wrench',
        pricingModel: 'BARGAIN_INDRIVE' as any,
        baseFare: suggested,
        perKmRate: 0,
        perMinuteRate: 0,
        minFare: 500,
        commissionPercentage: 10,
        isActive: true,
      },
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      customerPhone: currentUser.phoneNumber,
      status: ServiceRequestStatus.OFFERS_OPEN,
      pickupLatitude: pickupLocation.latitude,
      pickupLongitude: pickupLocation.longitude,
      pickupAddressText: pickupLocation.name,
      suggestedFare: suggested,
      customerOfferedFare: finalFare,
      finalAgreedFare: finalFare,
      surgeMultiplier: 1.0,
      metadata: { problemType, description },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const simulatedOffers: ServiceOffer[] = [
      {
        id: 'off-mech-1',
        serviceRequestId: requestId,
        providerId: 'prov-mech-001',
        providerName: 'Ustad Jamil (Auto Electrician & Battery)',
        providerRating: 4.95,
        providerTotalJobs: 620,
        offeredFare: finalFare,
        etaMinutes: 8,
        distanceKm: 1.8,
        status: OfferStatus.PENDING,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      },
      {
        id: 'off-mech-2',
        serviceRequestId: requestId,
        providerId: 'prov-mech-002',
        providerName: 'Korangi Mobile Towing & Tire Service',
        providerRating: 4.88,
        providerTotalJobs: 410,
        offeredFare: finalFare + 200,
        etaMinutes: 14,
        distanceKm: 3.5,
        status: OfferStatus.PENDING,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      },
    ];

    set({
      activeMechanic: newRequest,
      mechanicOffers: simulatedOffers,
    });
  },

  acceptMechanicOffer: (offerId) => {
    const { activeMechanic, mechanicOffers } = get();
    if (!activeMechanic) return;

    const selectedOffer = mechanicOffers.find((o) => o.id === offerId);
    if (!selectedOffer) return;

    const updated: ServiceRequest = {
      ...activeMechanic,
      status: ServiceRequestStatus.ACCEPTED,
      assignedProviderId: selectedOffer.providerId,
      assignedProviderName: selectedOffer.providerName,
      assignedProviderPhone: '+923004443322',
      finalAgreedFare: selectedOffer.offeredFare,
      acceptedAt: new Date().toISOString(),
    };

    set({
      activeMechanic: updated,
      mechanicOffers: [],
    });
  },

  toggleProviderOnline: () =>
    set((state) => ({ isProviderOnline: !state.isProviderOnline })),

  setProviderStep: (step) => set({ providerStep: step }),

  providerSendOffer: (requestId, fare) => {
    const { currentUser, incomingRequestsFeed, activeRide, activeOffers } = get();
    const targetRequest = incomingRequestsFeed.find((r) => r.id === requestId) || activeRide;

    const newOffer: ServiceOffer = {
      id: `off-prov-${Date.now()}`,
      serviceRequestId: requestId,
      providerId: currentUser.id || 'prov-driver-001',
      providerName: 'Captain Tariq Mehmood',
      providerRating: 4.9,
      providerTotalJobs: 342,
      vehicleInfo: {
        model: 'Toyota Corolla GLI',
        registrationNumber: 'KHI-9821',
        color: 'White',
      },
      offeredFare: fare,
      etaMinutes: 4,
      distanceKm: 1.2,
      status: OfferStatus.PENDING,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    };

    set({
      activeOffers: [newOffer, ...activeOffers],
    });
  },

  providerAcceptJob: (request, agreedFare) => {
    const fare = agreedFare || request.customerOfferedFare || request.finalAgreedFare || 420;
    const acceptedRide: ServiceRequest = {
      ...request,
      status: ServiceRequestStatus.ACCEPTED,
      assignedProviderId: 'prov-driver-001',
      assignedProviderName: 'Captain Tariq Mehmood',
      assignedProviderPhone: '+92 301 2345678',
      finalAgreedFare: fare,
      customerOfferedFare: fare,
      acceptedAt: new Date().toISOString(),
    };

    set((state) => ({
      activeRide: acceptedRide,
      providerStep: 'EN_ROUTE',
      incomingRequestsFeed: state.incomingRequestsFeed.filter((r) => r.id !== request.id),
    }));
  },

  providerDeclineJob: (requestId) => {
    set((state) => ({
      incomingRequestsFeed: state.incomingRequestsFeed.filter((r) => r.id !== requestId),
    }));
  },

  submitDriverReview: (driverId, rating, comment, tags) => {
    const { driverProfiles, currentUser } = get();
    const existingProfile = driverProfiles[driverId];
    if (!existingProfile) return;

    const newReview: DriverReview = {
      id: `rev-${Date.now()}`,
      driverId,
      customerId: currentUser.id,
      customerName: currentUser.fullName || 'Verified Passenger',
      rating,
      comment: comment?.trim() || undefined,
      tags: tags && tags.length > 0 ? tags : undefined,
      createdAt: 'Just now',
    };

    const newTotalRatings = existingProfile.totalRatings + 1;
    const newTotalTrips = existingProfile.totalTrips + 1;
    const updatedAverage =
      Math.round(
        (((existingProfile.ratingAverage * existingProfile.totalRatings) + rating) /
          newTotalRatings) *
          10
      ) / 10;

    set({
      driverProfiles: {
        ...driverProfiles,
        [driverId]: {
          ...existingProfile,
          ratingAverage: updatedAverage,
          totalRatings: newTotalRatings,
          totalTrips: newTotalTrips,
          reviews: [newReview, ...existingProfile.reviews],
        },
      },
    });
  },

  providerCompleteJob: (requestId, collectedFare) => {
    const { activeRide, providerRideHistory, providerTodayEarnings, providerCompletedJobsCount } = get();
    const finalFare = collectedFare || activeRide?.finalAgreedFare || 420;
    const commission = Math.round(finalFare * 0.15);
    const netEarning = finalFare - commission;

    const newHistoryItem: ProviderRideHistoryItem = {
      id: `hist-${Date.now()}`,
      customerName: activeRide?.customerName || 'Sara Qureshi',
      pickup: activeRide?.pickupAddressText || 'Dolmen Mall Clifton, Karachi',
      dropoff: activeRide?.dropoffAddressText || 'FTC Shahrah-e-Faisal, Karachi',
      fare: finalFare,
      commission,
      netEarning,
      completedAt: 'Just now',
    };

    set({
      providerTodayEarnings: providerTodayEarnings + netEarning,
      providerCompletedJobsCount: providerCompletedJobsCount + 1,
      providerRideHistory: [newHistoryItem, ...providerRideHistory],
      activeRide: null,
      providerStep: 'COMPLETED',
    });
  },

  providerWithdrawFunds: (amount, method, accountDetails) => {
    const { providerTodayEarnings } = get();
    if (amount > providerTodayEarnings) return false;
    set((state) => ({
      providerTodayEarnings: state.providerTodayEarnings - amount,
    }));
    return true;
  },
}));
