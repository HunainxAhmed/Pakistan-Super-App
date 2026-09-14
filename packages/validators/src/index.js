"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateHomeServiceRequestSchema = exports.CreateMechanicRequestSchema = exports.CreateOfferSchema = exports.CreateRideRequestSchema = exports.VerifyOtpSchema = exports.RequestOtpSchema = exports.PakistaniCnicSchema = exports.PakistaniPhoneSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("@superapp/types");
// Pakistani mobile phone regex: +92 followed by 3XX XXXXXXX or 03XX XXXXXXX
exports.PakistaniPhoneSchema = zod_1.z
    .string()
    .trim()
    .regex(/^((\+92)|(0092)|(92)|(0))?3[0-9]{2}[0-9]{7}$/, 'Invalid Pakistani phone number. Format: +923001234567 or 03001234567')
    .transform((val) => {
    let clean = val.replace(/[\s-]/g, '');
    if (clean.startsWith('03')) {
        clean = '+92' + clean.slice(1);
    }
    else if (clean.startsWith('923')) {
        clean = '+' + clean;
    }
    else if (clean.startsWith('00923')) {
        clean = '+92' + clean.slice(4);
    }
    return clean;
});
// Pakistani CNIC regex: 42101-1234567-1
exports.PakistaniCnicSchema = zod_1.z
    .string()
    .trim()
    .regex(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, 'Invalid Pakistani CNIC. Must match format: 12345-1234567-1');
exports.RequestOtpSchema = zod_1.z.object({
    phoneNumber: exports.PakistaniPhoneSchema,
});
exports.VerifyOtpSchema = zod_1.z.object({
    phoneNumber: exports.PakistaniPhoneSchema,
    otpCode: zod_1.z.string().length(4, 'OTP must be 4 digits'),
});
exports.CreateRideRequestSchema = zod_1.z.object({
    pickupLatitude: zod_1.z.number().min(-90).max(90),
    pickupLongitude: zod_1.z.number().min(-180).max(180),
    pickupAddressText: zod_1.z.string().min(3, 'Pickup address is required'),
    dropoffLatitude: zod_1.z.number().min(-90).max(90),
    dropoffLongitude: zod_1.z.number().min(-180).max(180),
    dropoffAddressText: zod_1.z.string().min(3, 'Dropoff address is required'),
    vehicleCategory: zod_1.z.nativeEnum(types_1.VehicleCategory),
    customerOfferedFare: zod_1.z.number().positive().optional(),
});
exports.CreateOfferSchema = zod_1.z.object({
    serviceRequestId: zod_1.z.string().uuid(),
    offeredFare: zod_1.z.number().positive('Fare must be greater than zero'),
    etaMinutes: zod_1.z.number().int().min(1).max(120),
    distanceKm: zod_1.z.number().positive(),
});
exports.CreateMechanicRequestSchema = zod_1.z.object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    addressText: zod_1.z.string().min(3),
    vehicleType: zod_1.z.enum(['BIKE', 'CAR', 'COMMERCIAL']),
    vehicleMake: zod_1.z.string().min(2),
    vehicleModel: zod_1.z.string().min(1),
    problemType: zod_1.z.nativeEnum(types_1.MechanicProblemType),
    description: zod_1.z.string().min(5, 'Please provide a brief description of the breakdown'),
    customerOfferedFare: zod_1.z.number().positive().optional(),
});
exports.CreateHomeServiceRequestSchema = zod_1.z.object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    addressText: zod_1.z.string().min(3),
    category: zod_1.z.nativeEnum(types_1.HomeServiceCategory),
    problemTitle: zod_1.z.string().min(3),
    problemDescription: zod_1.z.string().min(5),
    isEmergency: zod_1.z.boolean().default(false),
    preferredTimeSlot: zod_1.z.string().optional(),
});
