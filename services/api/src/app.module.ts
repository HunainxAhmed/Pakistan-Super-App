import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { RideModule } from './modules/ride/ride.module';
import { BargainingModule } from './modules/bargaining/bargaining.module';
import { AssistanceModule } from './modules/assistance/assistance.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    RideModule,
    BargainingModule,
    AssistanceModule,
    RealtimeModule,
    AdminModule,
  ],
})
export class AppModule {}
