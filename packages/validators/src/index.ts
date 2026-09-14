import { z } from 'zod';
import { VehicleCategory, MechanicProblemType, HomeServiceCategory } from '@superapp/types';

// Pakistani mobile phone regex: +92 followed by 3XX XXXXXXX or 03XX XXXXXXX
export const PakistaniPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^((\+92)|(0092)|(92)|(0))?3[0-9]{2}[0-9]{7}$/,
    'Invalid Pakistani phone number. Format: +923001234567 or 03001234567'
  )
  .transform((val) => {
    let clean = val.replace(/[\s-]/g, '');
    if (clean.startsWith('03')) {
      clean = '+92' + clean.slice(1);
    } else if (clean.startsWith('923')) {
      clean = '+' + clean;
    } else if (clean.startsWith('00923')) {
      clean = '+92' + clean.slice(4);
    }
    return clean;
  });

// Pakistani CNIC regex: 42101-1234567-1
export const PakistaniCnicSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/,
    'Invalid Pakistani CNIC. Must match format: 12345-1234567-1'
  );

export const RequestOtpSchema = z.object({
  phoneNumber: PakistaniPhoneSchema,
});

export const VerifyOtpSchema = z.object({
  phoneNumber: PakistaniPhoneSchema,
  otpCode: z.string().length(4, 'OTP must be 4 digits'),
});

export const CreateRideRequestSchema = z.object({
  pickupLatitude: z.number().min(-90).max(90),
  pickupLongitude: z.number().min(-180).max(180),
  pickupAddressText: z.string().min(3, 'Pickup address is required'),
  dropoffLatitude: z.number().min(-90).max(90),
  dropoffLongitude: z.number().min(-180).max(180),
  dropoffAddressText: z.string().min(3, 'Dropoff address is required'),
  vehicleCategory: z.nativeEnum(VehicleCategory),
  customerOfferedFare: z.number().positive().optional(),
});

export const CreateOfferSchema = z.object({
  serviceRequestId: z.string().uuid(),
  offeredFare: z.number().positive('Fare must be greater than zero'),
  etaMinutes: z.number().int().min(1).max(120),
  distanceKm: z.number().positive(),
});

export const CreateMechanicRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  addressText: z.string().min(3),
  vehicleType: z.enum(['BIKE', 'CAR', 'COMMERCIAL']),
  vehicleMake: z.string().min(2),
  vehicleModel: z.string().min(1),
  problemType: z.nativeEnum(MechanicProblemType),
  description: z.string().min(5, 'Please provide a brief description of the breakdown'),
  customerOfferedFare: z.number().positive().optional(),
});

export const CreateHomeServiceRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  addressText: z.string().min(3),
  category: z.nativeEnum(HomeServiceCategory),
  problemTitle: z.string().min(3),
  problemDescription: z.string().min(5),
  isEmergency: z.boolean().default(false),
  preferredTimeSlot: z.string().optional(),
});
