export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OPERATIONS_MANAGER = 'OPERATIONS_MANAGER',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  RESTAURANT_MANAGER = 'RESTAURANT_MANAGER',
  SERVICE_CATEGORY_MANAGER = 'SERVICE_CATEGORY_MANAGER',
  PROVIDER = 'PROVIDER',
  DRIVER = 'DRIVER',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  MECHANIC = 'MECHANIC',
  TECHNICIAN = 'TECHNICIAN',
  CUSTOMER = 'CUSTOMER',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
}

export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  fullName: string;
  avatarUrl?: string;
  roles: UserRole[];
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  emergencyContactPhone?: string;
  ratingAverage: number;
  totalTrips: number;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  nationalIdNumber: string; // Pakistani CNIC format e.g. 42101-1234567-1
  verificationStatus: VerificationStatus;
  serviceCategories: string[]; // e.g. ['RIDE', 'MECHANIC', 'ELECTRICIAN']
  isOnline: boolean;
  ratingAverage: number;
  totalRatings: number;
  totalCompletedJobs: number;
  acceptanceRate: number;
  cancellationRate: number;
  currentLatitude?: number;
  currentLongitude?: number;
  currentBearing?: number;
  lastActiveAt?: string;
  vehicle?: ProviderVehicle;
}

export interface ProviderVehicle {
  id: string;
  providerId: string;
  type: string; // BIKE, RICKSHAW, CAR, TOW_TRUCK
  make: string; // e.g. Honda, Suzuki, Toyota
  model: string; // e.g. CD70, Mehran, Alto, Corolla
  year: number;
  registrationNumber: string; // Pakistani plate format e.g. KHI-1234, LEA-5678
  color: string;
  hasAirConditioning: boolean;
}

export interface SavedAddress {
  id: string;
  userId: string;
  label: 'HOME' | 'WORK' | 'OTHER';
  customName?: string;
  addressText: string;
  latitude: number;
  longitude: number;
}

export interface DriverReview {
  id: string;
  driverId: string;
  customerId?: string;
  customerName: string;
  rating: number; // 1 to 5
  comment?: string;
  tags?: string[];
  createdAt: string;
}

export interface DriverProfileDetail {
  id: string;
  name: string;
  phone: string;
  ratingAverage: number;
  totalRatings: number;
  totalTrips: number;
  memberSince: string;
  cnicVerified: boolean;
  drivingLicenseVerified: boolean;
  vehicle: {
    model: string;
    plate: string;
    color: string;
    year: number;
    hasAirConditioning: boolean;
  };
  badges: string[];
  reviews: DriverReview[];
}

