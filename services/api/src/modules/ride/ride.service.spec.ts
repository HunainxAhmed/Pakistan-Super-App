import { RideService } from './ride.service';
import { DatabaseService } from '../../database/database.service';
import { VehicleCategory } from '@superapp/types';

describe('RideService', () => {
  let service: RideService;
  let db: DatabaseService;

  beforeEach(() => {
    db = new DatabaseService();
    db.onModuleInit();
    service = new RideService(db);
  });

  describe('calculateFareBreakdown', () => {
    it('should calculate accurate fare breakdown for Bike', () => {
      const breakdown = service.calculateFareBreakdown(VehicleCategory.BIKE, 5.0, 15, 1.0);
      expect(breakdown.baseFare).toBe(80);
      expect(breakdown.bookingFee).toBe(15);
      expect(breakdown.currency).toBe('PKR');
      expect(breakdown.totalFare).toBeGreaterThanOrEqual(100);
    });

    it('should calculate accurate fare breakdown for AC Car with surge', () => {
      const breakdown = service.calculateFareBreakdown(VehicleCategory.AC_CAR, 10.0, 25, 1.5);
      expect(breakdown.baseFare).toBe(220);
      expect(breakdown.surgeMultiplier).toBe(1.5);
      expect(breakdown.surgeAmount).toBeGreaterThan(0);
      expect(breakdown.totalFare).toBeGreaterThan(breakdown.subtotal);
    });
  });

  describe('createRideRequest', () => {
    it('should create a new ride request in OFFERS_OPEN state and spawn initial offers', async () => {
      const request = await service.createRideRequest({
        customerId: 'cust-001',
        pickupLatitude: 24.8138,
        pickupLongitude: 67.0305,
        pickupAddressText: 'Dolmen Mall Clifton',
        dropoffLatitude: 24.8568,
        dropoffLongitude: 67.0544,
        dropoffAddressText: 'FTC Building Shahrah-e-Faisal',
        vehicleCategory: VehicleCategory.CAR,
      });

      expect(request.id).toBeDefined();
      expect(request.requestNumber).toMatch(/^PK-\d+/);
      expect(request.status).toBe('OFFERS_OPEN');

      const offers = db.offers.get(request.id);
      expect(offers).toBeDefined();
      expect(offers?.length).toBeGreaterThan(0);
    });
  });
});
