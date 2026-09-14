import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AssistanceService } from './assistance.service';
import { MechanicProblemType, HomeServiceCategory } from '@superapp/types';

class CreateMechanicDto {
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
}

class CreateHomeServiceDto {
  customerId: string;
  latitude: number;
  longitude: number;
  addressText: string;
  category: HomeServiceCategory;
  problemTitle: string;
  problemDescription: string;
  isEmergency?: boolean;
  preferredTimeSlot?: string;
}

@ApiTags('Assistance & Home Services')
@Controller('assistance')
export class AssistanceController {
  constructor(private readonly assistanceService: AssistanceService) {}

  @Post('mechanic/request')
  @ApiOperation({ summary: 'Request emergency roadside mechanic assistance with diagnostic info' })
  async requestMechanic(@Body() body: CreateMechanicDto) {
    return this.assistanceService.createMechanicRequest(body);
  }

  @Post('home-service/request')
  @ApiOperation({ summary: 'Request certified home service technician (Plumber, Electrician, AC)' })
  async requestHomeService(@Body() body: CreateHomeServiceDto) {
    return this.assistanceService.createHomeServiceRequest(body);
  }
}
