import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RideService } from './ride.service';
import { VehicleCategory } from '@superapp/types';

class EstimateDto {
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffLatitude: number;
  dropoffLongitude: number;
}

class CreateRideDto {
  customerId: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddressText: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  dropoffAddressText: string;
  vehicleCategory: VehicleCategory;
  customerOfferedFare?: number;
}

@ApiTags('Rides')
@Controller('rides')
export class RideController {
  constructor(private readonly rideService: RideService) {}

  @Post('estimates')
  @ApiOperation({ summary: 'Calculate route distance, duration and fare estimates for all vehicle types' })
  async getEstimates(@Body() body: EstimateDto) {
    return this.rideService.getVehicleEstimates(
      body.pickupLatitude,
      body.pickupLongitude,
      body.dropoffLatitude,
      body.dropoffLongitude
    );
  }

  @Post('requests')
  @ApiOperation({ summary: 'Create new ride request with target fare and trigger driver dispatch' })
  async createRequest(@Body() body: CreateRideDto) {
    return this.rideService.createRideRequest(body);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get ride request status and live details' })
  async getRequest(@Param('id') id: string) {
    return this.rideService.getRequestById(id);
  }

  @Patch('requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel active ride request' })
  async cancelRequest(
    @Param('id') id: string,
    @Body('reason') reason: string = 'Changed mind'
  ) {
    return this.rideService.cancelRequest(id, reason);
  }
}
