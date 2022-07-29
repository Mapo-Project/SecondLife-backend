import { Injectable, Logger } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { PickupRequestInputDto } from './dto/pickup.request.dto';

@Injectable()
export class PickupService {
  private logger = new Logger('PickupService');

  async pickupRequest(
    user_id: string,
    pickupRequestInputDto: PickupRequestInputDto,
  ) {
    const conn = getConnection();

    const found = await conn.query(``);
  }
}
