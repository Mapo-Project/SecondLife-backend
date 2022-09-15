import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { getConnection } from 'typeorm';
import {
  PickupPlaceDeleteInputDto,
  PickupPlaceDeleteOutputDto,
  PickupPlaceRegistrationInputDto,
  PickupPlaceRegistrationOutputDto,
  PickupPlaceSelectOutputDto,
} from './dto/pickup.place.dto';
import {
  PickupRequestInputDto,
  PickupRequestOutputDto,
} from './dto/pickup.request.dto';
import uuidRandom from './uuidRandom';

@Injectable()
export class PickupService {
  private logger = new Logger('PickupService');

  async pickupRequest(
    user_id: string,
    pickupRequestInputDto: PickupRequestInputDto,
  ): Promise<PickupRequestOutputDto> {
    const pick_up_id = uuidRandom();
    const {
      pick_up_num,
      address,
      green_bag_s,
      green_bag_m,
      green_bag_l,
      method_org,
      pick_up_dt,
      pick_up_tm,
      green_bag_yn,
    } = pickupRequestInputDto;
    const green_back_num = green_bag_s + green_bag_m + green_bag_l;

    if (pick_up_num > 60) {
      this.logger.verbose(`User ${user_id} 픽업 갯수 초과`);
      throw new HttpException('픽업 갯수 초과', HttpStatus.BAD_REQUEST);
    }

    if (green_back_num > 3) {
      this.logger.verbose(`User ${user_id} 그린백 갯수 초과`);
      throw new HttpException('그린백 갯수 초과', HttpStatus.BAD_REQUEST);
    }

    const conn = getConnection();
    const sql =
      `INSERT INTO PICK_UP(PICK_UP_ID, USER_ID, PICK_UP_NUM, ADDRESS, METHOD_ORGANIZING, 
                 PICK_UP_DATE, PICK_UP_TIME, GREEN_BAG_YN, INSERT_DT, INSERT_ID)
                 VALUES(?,?,?,?,?,?,?,?,NOW(),?);` +
      `INSERT INTO GREEN_BAG(PICK_UP_ID, GREEN_BAG_S, GREEN_BAG_M, GREEN_BAG_L)
                 VALUES(?,?,?,?);`;
    const params = [
      pick_up_id,
      user_id,
      pick_up_num,
      address,
      method_org,
      pick_up_dt,
      pick_up_tm,
      green_bag_yn,
      user_id,
      pick_up_id,
      green_bag_s,
      green_bag_m,
      green_bag_l,
    ];

    try {
      await conn.query(sql, params);

      this.logger.verbose(`User ${user_id} 픽업 신청 성공`);
      return {
        statusCode: 201,
        message: '픽업 신청 성공',
      };
    } catch (error) {
      this.logger.verbose(`User ${user_id} 픽업 신청 실패\n ${error}`);
      throw new HttpException('픽업 신청 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async getPickupRequest(user_id: string) {
    const conn = getConnection();

    try {
      const found = await conn.query(
        `SELECT * FROM PICK_UP WHERE USER_ID='${user_id}' AND USE_YN='Y';`,
      );

      this.logger.verbose(`User ${user_id} 픽업 신청 조회 성공`);
      return {
        statusCode: 200,
        message: '픽업 신청 조회 성공',
        data: found,
      };
    } catch (error) {
      this.logger.verbose(`User ${user_id} 픽업 신청 조회 실패\n ${error}`);
      throw new HttpException('픽업 신청 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async pickupPlaceRegistration(
    user_id: string,
    pickupPlaceRegistrationInputDto: PickupPlaceRegistrationInputDto,
  ): Promise<PickupPlaceRegistrationOutputDto> {
    const { address } = pickupPlaceRegistrationInputDto;
    const conn = getConnection();
    const sql = `INSERT INTO PICK_UP_LOC(USER_ID, ADDRESS, INSERT_DT, INSERT_ID)
                 VALUES(?,?,NOW(),?);`;
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

  async getPickupPlace(user_id: string): Promise<PickupPlaceSelectOutputDto> {
    const conn = getConnection();

    try {
      const found = await conn.query(
        `SELECT PICK_UP_LOC_ID AS pick_up_loc_id, ADDRESS AS address FROM PICK_UP_LOC 
         WHERE USER_ID='${user_id}' AND USE_YN='Y' ORDER BY INSERT_DT DESC LIMIT 3;`,
      );

      this.logger.verbose(`User ${user_id} 픽업 장소 조회 성공`);
      return {
        statusCode: 200,
        message: '픽업 장소 조회 성공',
        data: found,
      };
    } catch (error) {
      this.logger.verbose(`User ${user_id} 픽업 장소 조회\n ${error}`);
      throw new HttpException('픽업 장소 조회 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async deletePickupPlace(
    user_id: string,
    pickupPlaceDeleteInputDto: PickupPlaceDeleteInputDto,
  ): Promise<PickupPlaceDeleteOutputDto> {
    const { pick_up_loc_id } = pickupPlaceDeleteInputDto;
    const conn = getConnection();

    const [found] = await conn.query(
      `SELECT PICK_UP_LOC_ID FROM PICK_UP_LOC WHERE PICK_UP_LOC_ID='${pick_up_loc_id}' AND USE_YN='Y';`,
    );

    if (!found) {
      this.logger.verbose(`User ${user_id} pick_up_loc_id NOT_FOUND`);
      throw new HttpException('pick_up_loc_id NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    try {
      await conn.query(
        `UPDATE PICK_UP_LOC SET USE_YN='N', UPDATE_DT=NOW(), UPDATE_ID='${user_id}'
         WHERE PICK_UP_LOC_ID='${pick_up_loc_id}' AND USE_YN='Y';`,
      );

      this.logger.verbose(`User ${user_id} 픽업 장소 삭제 성공`);
      return {
        statusCode: 200,
        message: '픽업 장소 삭제 성공',
      };
    } catch (error) {
      this.logger.verbose(`User ${user_id} 픽업 장소 삭제 실패\n ${error}`);
      throw new HttpException('픽업 장소 삭제 실패', HttpStatus.BAD_REQUEST);
    }
  }
}
