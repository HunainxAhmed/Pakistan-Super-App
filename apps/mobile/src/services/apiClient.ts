import { Platform } from 'react-native';
import {
  VehicleCategory,
  VehicleEstimate,
  ServiceRequest,
  ServiceOffer,
  MechanicProblemType,
  HomeServiceCategory,
} from '@superapp/types';

// Use localhost for Web, and LAN IP 192.168.0.106 for physical devices connected on Wi-Fi
export const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:4000/api/v1'
    : 'http://192.168.0.106:4000/api/v1';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP error ${response.status}`);
      }

      const json = await response.json();
      return json.data as T;
    } catch (error) {
      console.warn(`[ApiClient] Request to ${url} failed:`, error);
      throw error;
    }
  }

  // 1. Vehicle Fare Estimates
  async getEstimates(params: {
    pickupLatitude: number;
    pickupLongitude: number;
    dropoffLatitude: number;
    dropoffLongitude: number;
  }): Promise<{ distanceKm: number; durationMinutes: number; estimates: VehicleEstimate[] }> {
    return this.request('/rides/estimates', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 2. Create Ride Request
  async createRideRequest(params: {
    customerId: string;
    pickupLatitude: number;
    pickupLongitude: number;
    pickupAddressText: string;
    dropoffLatitude: number;
    dropoffLongitude: number;
    dropoffAddressText: string;
    vehicleCategory: VehicleCategory;
    customerOfferedFare?: number;
  }): Promise<ServiceRequest> {
    return this.request('/rides/requests', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 3. Fetch inDrive Offers
  async getOffers(requestId: string): Promise<ServiceOffer[]> {
    return this.request(`/bargaining/requests/${requestId}/offers`);
  }

  // 4. Accept inDrive Offer
  async acceptOffer(requestId: string, offerId: string): Promise<ServiceRequest> {
    return this.request(`/bargaining/requests/${requestId}/offers/${offerId}/accept`, {
      method: 'POST',
    });
  }

  // 5. Cancel Active Request
  async cancelRequest(requestId: string, reason: string): Promise<ServiceRequest> {
    return this.request(`/rides/requests/${requestId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  // 6. Live Karachi Operations Radar
  async getRadarProviders(): Promise<any[]> {
    return this.request('/admin/operations/radar');
  }

  // 7. Roadside Mechanic Request
  async createMechanicRequest(params: {
    customerId: string;
    latitude: number;
    longitude: number;
    addressText: string;
    vehicleType: 'BIKE' | 'CAR' | 'COMMERCIAL';
    vehicleMake: string;
    vehicleModel: string;
    problemType: MechanicProblemType;
    description: string;
    customerOfferedFare?: number;
  }): Promise<ServiceRequest> {
    return this.request('/assistance/mechanic/request', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 8. Home Service Request
  async createHomeServiceRequest(params: {
    customerId: string;
    latitude: number;
    longitude: number;
    addressText: string;
    category: HomeServiceCategory;
    problemTitle: string;
    problemDescription: string;
    isEmergency?: boolean;
    preferredTimeSlot?: string;
  }): Promise<ServiceRequest> {
    return this.request('/assistance/home-service/request', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const apiClient = new ApiClient();
