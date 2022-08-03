import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { getConnection } from 'typeorm';
import {
  PickupPlaceRegistrationInputDto,
  PickupPlaceRegistrationOutputDto,
} from './dto/pickup.place.dto';
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

  async pickupPlaceRegistration(
    user_id: string,
    pickupPlaceRegistrationInputDto: PickupPlaceRegistrationInputDto,
  ): Promise<PickupPlaceRegistrationOutputDto> {
    const { address } = pickupPlaceRegistrationInputDto;
    const conn = getConnection();
    const sql = `INSERT INTO PICK_UP_LOC(USER_ID, ADDRESS, INSERT_DT, INSERT_ID)
                 VALUES(?,?,NOW(),?)`;
    const params = [user_id, address, user_id];

    try {
      await conn.query(sql, params);

      this.logger.verbose(`User ${user_id} 픽업 장소 등록 성공`);
      return {
        statusCode: 201,
        message: '픽업 장소 등록 성공',
      };
    } catch (error) {
      this.logger.verbose(`User ${user_id} 픽업 장소 등록 실패\n ${error}`);
      throw new HttpException('픽업 장소 등록 실패', HttpStatus.BAD_REQUEST);
    }
  }
}
