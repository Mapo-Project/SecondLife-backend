import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getConnection } from 'typeorm';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async kakaoCallBack(userKakaoDto: UserDto) {
    const { user_id, name, method, email, profile_img } = userKakaoDto;
    const verify = 'N';
    const status = 'P';
    const type = 'G';

    if (!name) {
      return Object.assign({
        statusCode: 400,
        message: '카카오 로그인 실패',
      });
    }

    const payload = { user_id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: `${process.env.JWT_SECRET_TIME}s`,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: `${process.env.REFRESH_JWT_SECRET_TIME}m`,
    });

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT user_id FROM user WHERE user_id='${user_id}' AND status='P'`,
    );

    if (!found) {
      const sql =
        'INSERT INTO user(user_id, name, method, email, verify, status, type, create_at, profile_img, refresh_token) VALUES(?,?,?,?,?,?,?,NOW(),?,?)';
      const params = [
        user_id,
        name,
        method,
        email,
        verify,
        status,
        type,
        profile_img,
        refreshToken,
      ];

      await conn.query(sql, params);

      return Object.assign({
        statusCode: 200,
        message: '카카오 로그인 성공',
        verify: verify,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }

    await conn.query(
      `UPDATE user SET refresh_token='${refreshToken}' WHERE user_id='${user_id}'`,
    );

    const [user_verify] = await conn.query(
      `SELECT verify FROM user WHERE user_id='${user_id}' AND status='P'`,
    );

    return Object.assign({
      statusCode: 200,
      message: '카카오 로그인 성공',
      verify: user_verify.verify,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  }

  async accessTokenReissuance(refreshToken: string) {
    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT user_id FROM user WHERE refresh_token='${refreshToken}'`,
    );

    if (found) {
      const user_id = found.user_id;
      const payload = { user_id };
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: `${process.env.JWT_SECRET_TIME}s`,
      });

      return Object.assign({
        statusCode: 200,
        message: 'accessToken 재발급 성공',
        accessToken: accessToken,
      });
    }

    return Object.assign({
      statusCode: 400,
      message: 'accessToken 재발급 실패',
    });
  }
}
