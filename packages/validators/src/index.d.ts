import { z } from 'zod';
import { VehicleCategory, MechanicProblemType, HomeServiceCategory } from '@superapp/types';
export declare const PakistaniPhoneSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const PakistaniCnicSchema: z.ZodString;
export declare const RequestOtpSchema: z.ZodObject<{
    phoneNumber: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    phoneNumber: string;
}, {
    phoneNumber: string;
}>;
export declare const VerifyOtpSchema: z.ZodObject<{
    phoneNumber: z.ZodEffects<z.ZodString, string, string>;
    otpCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phoneNumber: string;
    otpCode: string;
}, {
    phoneNumber: string;
    otpCode: string;
}>;
export declare const CreateRideRequestSchema: z.ZodObject<{
    pickupLatitude: z.ZodNumber;
    pickupLongitude: z.ZodNumber;
    pickupAddressText: z.ZodString;
    dropoffLatitude: z.ZodNumber;
    dropoffLongitude: z.ZodNumber;
    dropoffAddressText: z.ZodString;
    vehicleCategory: z.ZodNativeEnum<typeof VehicleCategory>;
    customerOfferedFare: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    pickupLatitude: number;
    pickupLongitude: number;
    pickupAddressText: string;
    dropoffLatitude: number;
    dropoffLongitude: number;
    dropoffAddressText: string;
    vehicleCategory: VehicleCategory;
    customerOfferedFare?: number | undefined;
}, {
    pickupLatitude: number;
    pickupLongitude: number;
    pickupAddressText: string;
    dropoffLatitude: number;
    dropoffLongitude: number;
    dropoffAddressText: string;
    vehicleCategory: VehicleCategory;
    customerOfferedFare?: number | undefined;
}>;
export declare const CreateOfferSchema: z.ZodObject<{
    serviceRequestId: z.ZodString;
    offeredFare: z.ZodNumber;
    etaMinutes: z.ZodNumber;
    distanceKm: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    serviceRequestId: string;
    offeredFare: number;
    etaMinutes: number;
    distanceKm: number;
}, {
    serviceRequestId: string;
    offeredFare: number;
    etaMinutes: number;
    distanceKm: number;
}>;
export declare const CreateMechanicRequestSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    addressText: z.ZodString;
    vehicleType: z.ZodEnum<["BIKE", "CAR", "COMMERCIAL"]>;
    vehicleMake: z.ZodString;
    vehicleModel: z.ZodString;
    problemType: z.ZodNativeEnum<typeof MechanicProblemType>;
    description: z.ZodString;
    customerOfferedFare: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    latitude: number;
    longitude: number;
    addressText: string;
    vehicleType: "BIKE" | "CAR" | "COMMERCIAL";
    vehicleMake: string;
    vehicleModel: string;
    problemType: MechanicProblemType;
    description: string;
    customerOfferedFare?: number | undefined;
}, {
    latitude: number;
    longitude: number;
    addressText: string;
    vehicleType: "BIKE" | "CAR" | "COMMERCIAL";
    vehicleMake: string;
    vehicleModel: string;
    problemType: MechanicProblemType;
    description: string;
    customerOfferedFare?: number | undefined;
}>;
export declare const CreateHomeServiceRequestSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    addressText: z.ZodString;
    category: z.ZodNativeEnum<typeof HomeServiceCategory>;
    problemTitle: z.ZodString;
    problemDescription: z.ZodString;
    isEmergency: z.ZodDefault<z.ZodBoolean>;
    preferredTimeSlot: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    latitude: number;
    longitude: number;
    addressText: string;
    category: HomeServiceCategory;
    problemTitle: string;
    problemDescription: string;
    isEmergency: boolean;
    preferredTimeSlot?: string | undefined;
}, {
    latitude: number;
    longitude: number;
    addressText: string;
    category: HomeServiceCategory;
    problemTitle: string;
    problemDescription: string;
    isEmergency?: boolean | undefined;
    preferredTimeSlot?: string | undefined;
}>;
