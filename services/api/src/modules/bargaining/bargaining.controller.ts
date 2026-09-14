import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BargainingService } from './bargaining.service';

class SubmitOfferDto {
  serviceRequestId: string;
  providerId: string;
  offeredFare: number;
  etaMinutes: number;
  distanceKm: number;
}

@ApiTags('Bargaining')
@Controller('bargaining')
export class BargainingController {
  constructor(private readonly bargainingService: BargainingService) {}

  @Get('requests/:requestId/offers')
  @ApiOperation({ summary: 'Get active incoming offers for request' })
  async getOffers(@Param('requestId') requestId: string) {
    return this.bargainingService.getOffersForRequest(requestId);
  }

  @Post('offers')
  @ApiOperation({ summary: 'Provider submits a counter-offer for a service request' })
  async submitOffer(@Body() body: SubmitOfferDto) {
    return this.bargainingService.submitOffer(body);
  }

  @Post('requests/:requestId/offers/:offerId/accept')
  @ApiOperation({ summary: 'Customer accepts a specific provider offer' })
  async acceptOffer(
    @Param('requestId') requestId: string,
    @Param('offerId') offerId: string
  ) {
    return this.bargainingService.acceptOffer(requestId, offerId);
  }
}
