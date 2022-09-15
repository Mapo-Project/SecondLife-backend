import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PickupController } from './pickup.controller';
import { PickupService } from './pickup.service';

@Module({
  imports: [AuthModule],
  controllers: [PickupController],
  providers: [PickupService],
})
export class PickupModule {}
