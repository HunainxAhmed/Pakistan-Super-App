import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { VerificationStatus } from '@superapp/types';

@ApiTags('Admin Operations')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('operations/overview')
  @ApiOperation({ summary: 'Get live system metrics: active rides, online drivers, GMV, commission' })
  async getOverview() {
    return this.adminService.getOperationsOverview();
  }

  @Get('operations/radar')
  @ApiOperation({ summary: 'Get all online providers on the live Karachi radar map' })
  async getRadar() {
    return this.adminService.getLiveRadarProviders();
  }

  @Get('requests')
  @ApiOperation({ summary: 'List all ecosystem service requests for operational intervention' })
  async getAllRequests() {
    return this.adminService.getAllRequests();
  }

  @Patch('providers/:id/verify')
  @ApiOperation({ summary: 'Admin KYC verification review for driver/mechanic/technician' })
  async verifyProvider(
    @Param('id') id: string,
    @Body('status') status: VerificationStatus
  ) {
    return this.adminService.updateProviderVerification(id, status);
  }
}
