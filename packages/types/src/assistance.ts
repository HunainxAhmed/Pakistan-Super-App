export enum MechanicProblemType {
  DEAD_BATTERY = 'DEAD_BATTERY',
  FLAT_TIRE = 'FLAT_TIRE',
  OVERHEATING = 'OVERHEATING',
  FUEL_DELIVERY = 'FUEL_DELIVERY',
  LOCKOUT = 'LOCKOUT',
  ENGINE_TROUBLE = 'ENGINE_TROUBLE',
  TOWING_SERVICE = 'TOWING_SERVICE',
  GENERAL_INSPECTION = 'GENERAL_INSPECTION',
}

export interface MechanicAssistanceDetails {
  vehicleType: 'BIKE' | 'CAR' | 'COMMERCIAL';
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: number;
  problemType: MechanicProblemType;
  description: string;
  photoUrls?: string[];
  requiresTowing: boolean;
}

export enum HomeServiceCategory {
  ELECTRICIAN = 'ELECTRICIAN',
  PLUMBER = 'PLUMBER',
  AC_TECHNICIAN = 'AC_TECHNICIAN',
  CARPENTER = 'CARPENTER',
  APPLIANCE_REPAIR = 'APPLIANCE_REPAIR',
  CLEANING = 'CLEANING',
  PAINTER = 'PAINTER',
}

export interface HomeServiceDetails {
  category: HomeServiceCategory;
  problemTitle: string;
  problemDescription: string;
  preferredTimeSlot?: string;
  isEmergency: boolean;
  photoUrls?: string[];
}
