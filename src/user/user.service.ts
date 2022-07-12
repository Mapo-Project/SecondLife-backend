import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
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
import {
  PasswordChangeInputDto,
  PasswordTestInputDto,
} from './dto/user.password.dto';
import * as bcrypt from 'bcryptjs';
import { UserSignupInputDto } from './dto/user.signup.dto';
import { UserLoginInputDto } from './dto/user.login.dto';
import { JwtService } from '@nestjs/jwt';
import * as pbkdf2 from 'pbkdf2-sha256';
import { UserFindIdInputDto } from './dto/user.find.id.dto';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');
  constructor(private jwtService: JwtService) {}

  async nickNameDuplicate(
    nickNameDuplicateInputDto: NickNameDuplicateInputDto,
  ) {
    const { nickname } = nickNameDuplicateInputDto;

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT NICKNAME FROM USER WHERE NICKNAME='${nickname}'`,
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
      `SELECT USER_ID FROM USER WHERE USER_ID='${user_id}'`,
    );

    this.logger.verbose(`UserId: ${user_id} 중복체크`);
    return found
      ? Object.assign({
          statusCode: 200,
          message: '아이디 중복체크 조회 성공',
          duplicate: 'true',
        })
      : Object.assign({
          statusCode: 200,
          message: '아이디 중복체크 조회 성공',
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

  private sendSMS(sendObject: any) {
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
          to: sendObject.phone_number, // 수신자 번호
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
    const sendObject = {
      phone_number: phone_number,
      type: 'auth',
    };

    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE PHONE_NUM='${phone_number}' AND METHOD='general' AND STATUS='P'`,
    );

    if (!found) {
      return await this.sendSMS(sendObject);
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
      `SELECT USER_ID FROM USER WHERE PHONE_NUM='${phone_number}' AND METHOD='general' AND STATUS='P'`,
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

  async passwordFirstTest(passwordTestInputDto: PasswordTestInputDto) {
    const { password } = passwordTestInputDto;

    const cryptoSalt = process.env.CRYPTOSALT;
    const cryptoPassword = await pbkdf2(
      password,
      cryptoSalt,
      parseInt(process.env.REPEAT_NUMBER),
      parseInt(process.env.LENGTH),
    );
    const hashed = await cryptoPassword.toString(process.env.HASHED);

    return {
      password: hashed,
    };
  }

  async getFindUserId(userFindIdInputDto: UserFindIdInputDto) {
    const { name, email } = userFindIdInputDto;

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE NAME='${name}' AND EMAIL='${email}' AND STATUS='P' AND METHOD='general'`,
    );

    if (found) {
      this.logger.verbose(`User: ${found.USER_ID} 아이디 찾기 성공`);
      return Object.assign({
        statusCode: 201,
        message: '유저 아이디 조회 성공',
        user_id: found.USER_ID,
      });
    }

    return Object.assign({
      statusCode: 201,
      message: '가입된 회원정보가 없습니다.',
      user_id: null,
    });
  }

  async generalChangePassword(
    user_id: string,
    passwordChangeInputDto: PasswordChangeInputDto,
  ) {
    const { original_password, change_password } = passwordChangeInputDto;

    const conn = getConnection();
    const [user] = await conn.query(
      `SELECT USER_ID, PASSWORD FROM USER WHERE USER_ID='${user_id}' AND STATUS='P' AND METHOD='general' AND VERIFY='Y'`,
    );

    if (user && (await bcrypt.compare(change_password, user.PASSWORD))) {
      this.logger.warn(`User ${user_id} 일반 회원 비밀번호 변경 실패`);
      return Object.assign({
        statusCode: 404,
        message: '변경할 비밀번호가 기존 비밀번호와 동일 합니다.',
      });
    }

    if (user && (await bcrypt.compare(original_password, user.PASSWORD))) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(change_password, salt);

      await conn.query(
        `UPDATE USER SET PASSWORD='${hashedPassword}', UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
        WHERE USER_ID='${user_id}' AND STATUS='P' AND METHOD='general' AND VERIFY='Y'`,
      );

      this.logger.verbose(`User ${user_id} 일반 회원 비밀번호 변경 성공`);
      return Object.assign({
        statusCode: 201,
        message: '일반 회원 비밀번호 변경 성공',
      });
    } else {
      this.logger.warn(`User ${user_id} 일반 회원 비밀번호 변경 실패`);
      return Object.assign({
        statusCode: 400,
        message: '일반 회원 비밀번호 변경 실패',
      });
    }
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

    const method = 'general';
    const verify = 'Y';
    const status = 'P';
    const type = 'G';

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const conn = getConnection();
    const sql =
      'INSERT INTO USER(USER_ID, PASSWORD, NAME, NICKNAME, METHOD, PHONE_NUM, EMAIL, VERIFY, STATUS, TYPE, INSERT_DT, INSERT_ID, PROFILE_IMG) VALUES(?,?,?,?,?,?,?,?,?,?,NOW(),?,?)';
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
      user_id,
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
        console.log(error);
        throw new ConflictException(`${error.sqlMessage}`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async generalLogin(userLoginInputDto: UserLoginInputDto) {
    const { user_id, password } = userLoginInputDto;
    const conn = getConnection();
    const [user] = await conn.query(
      `SELECT USER_ID, PASSWORD FROM USER WHERE USER_ID='${user_id}' AND STATUS='P' AND METHOD='general'`,
    );

    if (user && (await bcrypt.compare(password, user.PASSWORD))) {
      const payload = { user_id };
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: `${process.env.JWT_SECRET_TIME}s`,
      });
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: `${process.env.REFRESH_JWT_SECRET_TIME}m`,
      });

      await conn.query(
        `UPDATE USER SET REFRESH_TOKEN='${refreshToken}', UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
         WHERE USER_ID='${user_id}' AND STATUS='P' AND METHOD='general'`,
      );

      const loginObject = Object.assign({
        statusCode: 201,
        message: '로그인 성공',
        accessToken: accessToken,
        refreshToken: refreshToken,
      });

      this.logger.verbose(`User ${user_id} 일반 로그인 성공
      Payload: ${JSON.stringify(loginObject)}`);

      return loginObject;
    } else {
      this.logger.warn(`User ${user_id} 일반 로그인 실패`);
      throw new UnauthorizedException('로그인 실패');
    }
  }

  async addUserProfile(
    user_id: string,
    profileDetailInputDto: ProfileDetailInputDto,
  ) {
    const { name, nickname } = profileDetailInputDto;

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE USER_ID='${user_id}' AND STATUS='P' AND VERIFY='Y'`,
    );

    if (!found) {
      try {
        await conn.query(
          `UPDATE USER SET NAME='${name}', NICKNAME='${nickname}', VERIFY='Y', UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
          WHERE USER_ID='${user_id}' AND STATUS='P'`,
        );
        this.logger.verbose(`User ${user_id} 회원 프로필 추가정보 등록 성공`);
        return Object.assign({
          statusCode: 201,
          message: '회원 프로필 추가정보 등록 성공',
        });
      } catch (error) {
        this.logger.error(`회원 프로필 추가정보 등록 실패
        Error: ${error}`);
        if (error.code === 'ER_DUP_ENTRY') {
          throw new ConflictException(`${error.sqlMessage}`);
        } else {
          throw new InternalServerErrorException();
        }
      }
    }

    this.logger.verbose(`User ${user_id} 회원 프로필 추가정보 등록 실패`);
    return Object.assign({
      statusCode: 400,
      message: '회원 프로필 추가정보가 등록된 회원 입니다.',
    });
  }

  async getUserProfile(user_id: string) {
    const conn = getConnection();
    const [user] = await conn.query(
      `SELECT NAME AS name, NICKNAME AS nickname, METHOD AS method, 
       EMAIL AS email, PROFILE_IMG AS profile_img FROM USER 
       WHERE USER_ID='${user_id}' AND VERIFY='Y' AND STATUS='P'`,
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

    try {
      await conn.query(
        `UPDATE USER SET NAME='${name}', NICKNAME='${nickname}', EMAIL='${email}', UPDATE_DT=NOW(), UPDATE_ID='${user_id}'
        WHERE USER_ID='${user_id}' AND VERIFY='Y' AND STATUS='P' `,
      );

      this.logger.verbose(`User ${user_id} 회원 프로필 수정 성공`);
      return Object.assign({
        statusCode: 201,
        message: '회원 프로필 수정 성공',
      });
    } catch (error) {
      this.logger.error(`회원 프로필 추가정보 수정 실패
      Error: ${error}`);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`${error.sqlMessage}`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async modifyUserProfileImg(user_id: string, file: string) {
    if (file) {
      const generatedFile = createImageURL(file);
      const conn = getConnection();

      await conn.query(
        `UPDATE USER SET PROFILE_IMG='${generatedFile}', UPDATE_DT=NOW(), UPDATE_ID='${user_id}'
          WHERE USER_ID='${user_id}' AND VERIFY='Y' AND STATUS='P' `,
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
      `UPDATE USER SET REFRESH_TOKEN=NULL, UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
       WHERE USER_ID='${user_id}' AND status='P'`,
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
      `UPDATE USER SET STATUS='D', EMAIL=NULL, REFRESH_TOKEN=NULL, DELETE_DT=NOW(), DELETE_ID='${user_id}' 
       WHERE USER_ID='${user_id}' AND STATUS='P'`,
    );

    this.logger.verbose(`User ${user_id} 회원 탈퇴 성공`);
    return Object.assign({
      statusCode: 200,
      message: '회원 탈퇴 성공',
    });
  }
}
