import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { getConnection } from 'typeorm';
import { UserAuthPhoneInputDto } from './dto/user.auth.dto';
import {
  NickNameDuplicateInputDto,
  UserIdDuplicateInputDto,
} from './dto/user.duplicate.dto';
import {
  ModifyProfileDetailInputDto,
  ProfileDetailInputDto,
} from './dto/user.profile.dto';
import { createImageURL } from './multerOptions';
import axios from 'axios';
import * as crypto from 'crypto';
import { PasswordInputDto } from './dto/user.password.dto';
import * as bcrypt from 'bcryptjs';
import { UserSignupInputDto } from './dto/user.signup.dto';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');

  async nickNameDuplicate(
    nickNameDuplicateInputDto: NickNameDuplicateInputDto,
  ) {
    const { nickname } = nickNameDuplicateInputDto;

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT nickname FROM user WHERE nickname='${nickname}'`,
    );

    this.logger.verbose(`Nickname: ${nickname} 중복체크`);
    return found
      ? Object.assign({
          statusCode: 200,
          message: '닉네임 중복체크 조회 성공',
          duplicate: 'true',
        })
      : Object.assign({
          statusCode: 200,
          message: '닉네임 중복체크 조회 성공',
          duplicate: 'false',
        });
  }

  async userIdDuplicate(userIdDuplicateInputDto: UserIdDuplicateInputDto) {
    const { user_id } = userIdDuplicateInputDto;

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT user_id FROM user WHERE user_id='${user_id}'`,
    );

    this.logger.verbose(`UserId: ${user_id} 중복체크`);
    return found
      ? Object.assign({
          statusCode: 200,
          message: '닉네임 중복체크 조회 성공',
          duplicate: 'true',
        })
      : Object.assign({
          statusCode: 200,
          message: '닉네임 중복체크 조회 성공',
          duplicate: 'false',
        });
  }

  private makeSignature(): string {
    const message = [];
    const hmac = crypto.createHmac('sha256', process.env.NCP_SECRET_KEY);
    const space = ' ';
    const newLine = '\n';
    const method = 'POST';
    const timestamp = Date.now().toString();

    message.push(method);
    message.push(space);
    message.push(process.env.NCP_URI);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(process.env.NCP_ACCESS_KEY);

    //시그니쳐 생성
    const signature = hmac.update(message.join('')).digest('base64');
    //string 으로 반환
    return signature.toString();
  }

  private sendSMS(phone_number: string) {
    const number: number =
      Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
    const body = {
      type: 'SMS',
      contentType: 'COMM',
      countryCode: '82',
      from: process.env.HOST_PHONE_NUMBER, // 발신자 번호
      content: `인증번호는 [${number}] 입니다.`,
      messages: [
        {
          to: phone_number, // 수신자 번호
        },
      ],
    };
    const options = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-iam-access-key': process.env.NCP_ACCESS_KEY,
        'x-ncp-apigw-timestamp': Date.now().toString(),
        'x-ncp-apigw-signature-v2': this.makeSignature(),
      },
    };
    axios.post(process.env.NCP_URL, body, options).catch((err) => {
      this.logger.error(`문자 전송 실패
      Error: ${err}`);
      return new InternalServerErrorException();
    });

    this.logger.verbose(`휴대폰 인증 번호 생성 성공`);
    return Object.assign({
      statusCode: 200,
      message: '휴대폰 인증 번호 생성 성공',
      code: number,
    });
  }

  async userSignupAuthPhone(userAuthPhoneInputDto: UserAuthPhoneInputDto) {
    const { phone_number } = userAuthPhoneInputDto;
    const conn = getConnection();

    const [found] = await conn.query(
      `SELECT user_id FROM user WHERE phone_num='${phone_number}' AND method='general' AND status='P'`,
    );

    if (!found) {
      return await this.sendSMS(phone_number);
    }

    this.logger.verbose(`일반 회원가입 휴대폰 인증 실패`);
    return Object.assign({
      statusCode: 400,
      message: '등록된 휴대폰 번호가 존재합니다.',
    });
  }

  async userSignupAuthPhoneTest(userAuthPhoneInputDto: UserAuthPhoneInputDto) {
    const { phone_number } = userAuthPhoneInputDto;
    const conn = getConnection();

    const [found] = await conn.query(
      `SELECT user_id FROM user WHERE phone_num='${phone_number}' AND method='general' AND status='P'`,
    );

    if (!found) {
      const number: number =
        Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
      this.logger.verbose(`휴대폰 인증 테스트 번호 생성 성공`);
      return Object.assign({
        statusCode: 200,
        message: '휴대폰 인증 번호 생성 성공',
        code: number,
      });
    }

    this.logger.verbose(`일반 회원가입 휴대폰 인증 실패`);
    return Object.assign({
      statusCode: 400,
      message: '등록된 휴대폰 번호가 존재합니다.',
    });
  }

  async passwordTest(passwordInputDto: PasswordInputDto) {
    const { password } = passwordInputDto;

    const bcryptSalt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, bcryptSalt);

    return {
      password: hashedPassword,
    };
  }

  async generalSignUp(userSignupInputDto: UserSignupInputDto, file: string) {
    const {
      user_id,
      password,
      name,
      nickname,
      phone_num,
      email,
      phone_verify,
    } = userSignupInputDto;

    if (!file) {
      file = process.env.PROFILE_IMG_DEFAULT;
    } else {
      file = createImageURL(file);
    }
    console.log(file);

    const method = 'general';
    const verify = 'Y';
    const status = 'P';
    const type = 'G';

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const conn = getConnection();
    const sql =
      'INSERT INTO user(user_id, password, name, nickname, method, phone_num, email, verify, status, type, create_at, profile_img) VALUES(?,?,?,?,?,?,?,?,?,?,NOW(),?)';
    const params = [
      user_id,
      hashedPassword,
      name,
      nickname,
      method,
      phone_num,
      email,
      verify,
      status,
      type,
      file,
    ];
    try {
      if (phone_verify === 'Y') {
        await conn.query(sql, params);
        this.logger.verbose(`User ${user_id} 일반 회원가입 성공`);
        return Object.assign({
          statusCode: 201,
          message: '일반 회원가입 성공',
        });
      } else {
        this.logger.warn(`휴대폰 인증 실패`);
        return Object.assign({
          statusCode: 406,
          message: '휴대폰 인증 실패',
        });
      }
    } catch (error) {
      this.logger.error(`일반 회원가입 실패
      Error: ${error}`);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('중복된 user_id 또는 nickname 존재합니다.');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async addUserProfile(
    user_id: string,
    profileDetailInputDto: ProfileDetailInputDto,
  ) {
    const { name, nickname } = profileDetailInputDto;

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT nickname FROM user WHERE nickname='${nickname}'`,
    );

    if (!found) {
      await conn.query(
        `UPDATE user SET name='${name}', nickname='${nickname}', verify='Y', update_at=NOW() 
        WHERE user_id='${user_id}' AND status='P'`,
      );
      this.logger.verbose(`User ${user_id} 회원 프로필 추가정보 등록 성공`);
      return Object.assign({
        statusCode: 201,
        message: '회원 프로필 추가정보 등록 성공',
      });
    }

    this.logger.verbose(`User ${user_id} 회원 프로필 추가정보 등록 실패`);
    return Object.assign({
      statusCode: 400,
      message: '회원 프로필 추가정보 등록 실패',
    });
  }

  async getUserProfile(user_id: string) {
    const conn = getConnection();
    const [user] = await conn.query(
      `SELECT name, nickname, method, email, profile_img FROM user 
      WHERE user_id='${user_id}' AND verify='Y' AND status='P'`,
    );

    if (user) {
      this.logger.verbose(`User ${user_id} 회원 프로필 조회 성공`);
      return Object.assign({
        statusCode: 200,
        message: '회원 프로필 조회 성공',
        data: user,
      });
    } else {
      this.logger.verbose(`User ${user_id} 회원 프로필 조회 실패`);
      return Object.assign({
        statusCode: 400,
        message: '회원 프로필 조회 실패',
      });
    }
  }

  async modifyUserProfile(
    user_id: string,
    modifyProfileDetailInputDto: ModifyProfileDetailInputDto,
  ) {
    const { name, nickname, email } = modifyProfileDetailInputDto;
    const conn = getConnection();

    const [found] = await conn.query(
      `SELECT nickname FROM user WHERE nickname = 
      (SELECT nickname FROM user WHERE nickname = '${nickname}') 
      AND nickname <> (SELECT nickname FROM user WHERE user_id = '${user_id}' AND status = 'P')`,
    );

    if (!found) {
      await conn.query(
        `UPDATE user SET name='${name}', nickname='${nickname}', email='${email}', update_at=NOW()
        WHERE user_id='${user_id}' AND verify='Y' AND status='P' `,
      );

      this.logger.verbose(`User ${user_id} 회원 프로필 수정 성공`);
      return Object.assign({
        statusCode: 201,
        message: '회원 프로필 수정 성공',
      });
    }

    this.logger.verbose(`User ${user_id} 회원 프로필 수정 실패`);
    return Object.assign({
      statusCode: 400,
      message: '회원 프로필 수정 실패',
    });
  }

  async modifyUserProfileImg(user_id: string, file: string) {
    if (file) {
      const generatedFile = createImageURL(file);
      const conn = getConnection();

      await conn.query(
        `UPDATE user SET profile_img='${generatedFile}', update_at=NOW()
          WHERE user_id='${user_id}' AND verify='Y' AND status='P' `,
      );

      this.logger.verbose(`User ${user_id} 회원 프로필 이미지 수정 성공`);
      return Object.assign({
        statusCode: 201,
        message: '회원 프로필 이미지 수정 성공',
      });
    }

    this.logger.verbose(`User ${user_id} 회원 프로필 이미지 수정 실패`);
    return Object.assign({
      statusCode: 400,
      message: '회원 프로필 이미지 수정 실패',
    });
  }

  async userLogout(user_id: string) {
    const conn = getConnection();
    await conn.query(
      `UPDATE user SET refresh_token= NULL WHERE user_id='${user_id}' AND status='P'`,
    );

    this.logger.verbose(`User ${user_id} 회원 로그아웃 성공`);
    return Object.assign({
      statusCode: 200,
      message: '회원 로그아웃 성공',
    });
  }

  async userWithdrawal(user_id: string) {
    const conn = getConnection();
    await conn.query(
      `UPDATE user SET status='D', delete_at=NOW() WHERE user_id='${user_id}' AND status='P'`,
    );

    this.logger.verbose(`User ${user_id} 회원 탈퇴 성공`);
    return Object.assign({
      statusCode: 200,
      message: '회원 탈퇴 성공',
    });
  }
}
