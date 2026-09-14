export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    OPERATIONS_MANAGER = "OPERATIONS_MANAGER",
    FINANCE_MANAGER = "FINANCE_MANAGER",
    SUPPORT_AGENT = "SUPPORT_AGENT",
    RESTAURANT_MANAGER = "RESTAURANT_MANAGER",
    SERVICE_CATEGORY_MANAGER = "SERVICE_CATEGORY_MANAGER",
    PROVIDER = "PROVIDER",
    DRIVER = "DRIVER",
    DELIVERY_PARTNER = "DELIVERY_PARTNER",
    MECHANIC = "MECHANIC",
    TECHNICIAN = "TECHNICIAN",
    CUSTOMER = "CUSTOMER"
}
export declare enum AccountStatus {
    ACTIVE = "ACTIVE",
    PENDING_VERIFICATION = "PENDING_VERIFICATION",
    SUSPENDED = "SUSPENDED",
    BANNED = "BANNED"
}
export declare enum VerificationStatus {
    PENDING = "PENDING",
    UNDER_REVIEW = "UNDER_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    SUSPENDED = "SUSPENDED",
    EXPIRED = "EXPIRED"
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
    nationalIdNumber: string;
    verificationStatus: VerificationStatus;
    serviceCategories: string[];
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
    type: string;
    make: string;
    model: string;
    year: number;
    registrationNumber: string;
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
