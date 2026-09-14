import { GeoCoordinates } from '@superapp/types';
export interface LocationLandmark {
    id: string;
    name: string;
    category: 'AIRPORT' | 'COMMERCIAL' | 'RESIDENTIAL' | 'HOSPITAL' | 'MALL';
    coordinates: GeoCoordinates;
    address: string;
    city: 'Karachi' | 'Lahore' | 'Islamabad';
}
export declare const PAKISTANI_LANDMARKS: LocationLandmark[];
