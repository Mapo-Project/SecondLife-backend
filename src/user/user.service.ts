import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { getConnection } from 'typeorm';
import {
  UserAuthPhoneInputDto,
  UserAuthPhoneOutputDto,
} from './dto/user.auth.dto';
import {
  UserIdDuplicateInputDto,
  UserIdDuplicateOutputDto,
} from './dto/user.duplicate.dto';
import {
  ModifyProfileDetailInputDto,
  ModifyProfileDetailOutputDto,
  ModifyProfileImgOutputDto,
  ProfileDetailInputDto,
  ProfileDetailOutputDto,
  SelectProfileOutputDto,
} from './dto/user.profile.dto';
import { createImageURL } from './multerOptions';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  PasswordChangeInputDto,
  PasswordChangeOutputDto,
  PasswordTestInputDto,
} from './dto/user.password.dto';
import * as bcrypt from 'bcryptjs';
import { UserSignupInputDto, UserSignupOutputDto } from './dto/user.signup.dto';
import { UserLoginInputDto, UserLoginOutputDto } from './dto/user.login.dto';
import { JwtService } from '@nestjs/jwt';
import {
  UserFindIdInputDto,
  UserFindIdOutputDto,
} from './dto/user.find.id.dto';
import { UserLogoutOutputDto } from './dto/user.logout.dto';
import { UserWithdrawalOutputDto } from './dto/user.withdrawal.dto';
import {
  UserFollowInputDto,
  UserFollowOutputDto,
  UserFollowwingOutputDto,
} from './dto/user.follow.dto';
import { UserTopSellerOutputDto } from './dto/user.seller.dto';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');
  constructor(private jwtService: JwtService) {}

  async userIdDuplicate(
    userIdDuplicateInputDto: UserIdDuplicateInputDto,
  ): Promise<UserIdDuplicateOutputDto> {
    const { user_id } = userIdDuplicateInputDto;

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE USER_ID='${user_id}'`,
    );

    this.logger.verbose(`UserId: ${user_id} 중복체크`);

    return found
      ? {
          statusCode: 200,
          message: '아이디 중복체크 조회 성공',
          duplicate: 'duplicate',
        }
      : {
          statusCode: 200,
          message: '아이디 중복체크 조회 성공',
          duplicate: 'unDuplicate',
        };
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

  private async sendSMS(phone_number: number) {
    let number = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
    const body = {
      type: 'SMS',
      contentType: 'COMM',
      countryCode: '82',
      from: process.env.HOST_PHONE_NUMBER, // 발신자 번호
      content: `[세컨드 라이프]\n인증번호는 [${number}] 입니다.`,
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

    await axios.post(process.env.NCP_URL, body, options).catch((err) => {
      this.logger.error(`문자 전송 실패 Error: ${err}`);
      number = 0;
      return number;
    });

    return number;
  }

  async userGeneralSignupAuthPhone(
    userAuthPhoneInputDto: UserAuthPhoneInputDto,
  ): Promise<UserAuthPhoneOutputDto> {
    const { phone_number } = userAuthPhoneInputDto;
    const conn = getConnection();

    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE PHONE_NUM='${phone_number}' AND ROLE_ID=2 AND STATUS='P';`,
    );

    if (!found) {
      const number = await this.sendSMS(phone_number);

      if (number !== 0) {
        this.logger.verbose(`휴대폰 인증 번호 생성 성공`);
        return {
          statusCode: 200,
          message: '휴대폰 인증 번호 생성 성공',
          code: number,
        };
      }

      this.logger.verbose(`휴대폰 인증 번호 생성 실패`);
      throw new HttpException(
        '휴대폰 인증 번호 생성 실패',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.verbose(`일반 회원가입 휴대폰 인증 실패`);
    throw new HttpException(
      '등록된 휴대폰 번호가 존재합니다.',
      HttpStatus.CONFLICT,
    );
  }

  async userSocialSignupAuthPhone(
    user_id: string,
    userAuthPhoneInputDto: UserAuthPhoneInputDto,
  ): Promise<UserAuthPhoneOutputDto> {
    const { phone_number } = userAuthPhoneInputDto;
    const conn = getConnection();

    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE PHONE_NUM='${phone_number}' AND 
       METHOD=(SELECT METHOD FROM USER WHERE USER_ID='${user_id}') AND STATUS='P';`,
    );

    if (!found) {
      const number = await this.sendSMS(phone_number);

      if (number !== 0) {
        this.logger.verbose(`휴대폰 인증 번호 생성 성공`);
        return {
          statusCode: 200,
          message: '휴대폰 인증 번호 생성 성공',
          code: number,
        };
      }

      this.logger.verbose(`휴대폰 인증 번호 생성 실패`);
      throw new HttpException(
        '휴대폰 인증 번호 생성 실패',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.verbose(`소셜 회원가입 휴대폰 인증 실패`);
    throw new HttpException(
      '등록된 휴대폰 번호가 존재합니다.',
      HttpStatus.CONFLICT,
    );
  }

  async userGeneralSignupAuthPhoneTest(
    userAuthPhoneInputDto: UserAuthPhoneInputDto,
  ): Promise<UserAuthPhoneOutputDto> {
    const { phone_number } = userAuthPhoneInputDto;
    const conn = getConnection();

    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE PHONE_NUM='${phone_number}' AND ROLE_ID=2 AND STATUS='P';`,
    );

    if (!found) {
      const number: number =
        Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
      this.logger.verbose(`휴대폰 인증 테스트 번호 생성 성공`);
      return {
        statusCode: 200,
        message: '휴대폰 인증 번호 생성 성공',
        code: number,
      };
    }

    this.logger.verbose(`일반 회원가입 휴대폰 인증 실패`);
    throw new HttpException(
      '등록된 휴대폰 번호가 존재합니다.',
      HttpStatus.CONFLICT,
    );
  }

  async userSocialSignupAuthPhoneTest(
    user_id: string,
    userAuthPhoneInputDto: UserAuthPhoneInputDto,
  ): Promise<UserAuthPhoneOutputDto> {
    const { phone_number } = userAuthPhoneInputDto;
    const conn = getConnection();

    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE PHONE_NUM='${phone_number}' AND 
       METHOD=(SELECT METHOD FROM USER WHERE USER_ID='${user_id}') AND STATUS='P';`,
    );

    if (!found) {
      const number: number =
        Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
      this.logger.verbose(`휴대폰 인증 테스트 번호 생성 성공`);
      return {
        statusCode: 200,
        message: '휴대폰 인증 번호 생성 성공',
        code: number,
      };
    }

    this.logger.verbose(`소셜 회원가입 휴대폰 인증 실패`);
    throw new HttpException(
      '등록된 휴대폰 번호가 존재합니다.',
      HttpStatus.CONFLICT,
    );
  }

  async passwordFirstTest(passwordTestInputDto: PasswordTestInputDto) {
    const { password } = passwordTestInputDto;

    const hash = process.env.HASH;
    const hashed = crypto.createHash(hash).update(password).digest('base64');

    return {
      password: hashed,
    };
  }

  async getFindUserId(
    userFindIdInputDto: UserFindIdInputDto,
  ): Promise<UserFindIdOutputDto> {
    const { name, email } = userFindIdInputDto;

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE NAME='${name}' AND EMAIL='${email}' AND STATUS='P';`,
    );

    if (found) {
      this.logger.verbose(`User: ${found.USER_ID} 아이디 찾기 성공`);
      return {
        statusCode: 200,
        message: '유저 아이디 조회 성공',
        user_id: found.USER_ID,
      };
    }

    throw new HttpException(
      '가입된 회원정보가 없습니다.',
      HttpStatus.BAD_REQUEST,
    );
  }

  async generalChangePassword(
    user_id: string,
    passwordChangeInputDto: PasswordChangeInputDto,
  ): Promise<PasswordChangeOutputDto> {
    const { original_password, change_password } = passwordChangeInputDto;

    const conn = getConnection();
    const [user] = await conn.query(
      `SELECT USER_ID, PASSWORD FROM USER WHERE USER_ID='${user_id}' AND STATUS='P' AND ROLE_ID=2 AND VERIFY='Y';`,
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
        WHERE USER_ID='${user_id}' AND STATUS='P' AND ROLE_ID=2 AND VERIFY='Y';`,
      );

      this.logger.verbose(`User ${user_id} 일반 회원 비밀번호 변경 성공`);
      return {
        statusCode: 201,
        message: '일반 회원 비밀번호 변경 성공',
      };
    } else {
      this.logger.warn(`User ${user_id} 일반 회원 비밀번호 변경 실패`);
      throw new HttpException(
        '일반 회원 비밀번호 변경 실패',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async generalSignUp(
    userSignupInputDto: UserSignupInputDto,
  ): Promise<UserSignupOutputDto> {
    const {
      user_id,
      password,
      name,
      birth,
      email,
      phone_num,
      address,
      detail_address,
      phone_verify,
    } = userSignupInputDto;
    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE PHONE_NUM='${phone_num}' AND ROLE_ID=2 AND STATUS='P';`,
    );

    if (found) {
      this.logger.verbose(`일반 회원가입 실패`);
      throw new HttpException(
        '등록된 휴대폰 번호가 존재합니다.',
        HttpStatus.CONFLICT,
      );
    }

    const method = 'general';
    const verify = 'Y';
    const role_id = 2;
    const profile_img = process.env.PROFILE_IMG_DEFAULT;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = `INSERT INTO USER(USER_ID, ROLE_ID, PASSWORD, NAME, BIRTH, EMAIL, PHONE_NUM, ADDRESS, 
                 DETAIL_ADDRESS, METHOD, VERIFY, INSERT_DT, INSERT_ID, PROFILE_IMG) 
                 VALUES(?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?);`;
    const params = [
      user_id,
      role_id,
      hashedPassword,
      name,
      birth,
      email,
      phone_num,
      address,
      detail_address,
      method,
      verify,
      user_id,
      profile_img,
    ];
    try {
      if (phone_verify === 'Y') {
        await conn.query(sql, params);
        this.logger.verbose(`User ${user_id} 일반 회원가입 성공`);
        return {
          statusCode: 201,
          message: '일반 회원가입 성공',
        };
      } else {
        throw new UnauthorizedException();
      }
    } catch (error) {
      this.logger.error(`일반 회원가입 실패
      Error: ${error}`);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`${error.sqlMessage}`);
      } else if (error.response.statusCode === 401) {
        this.logger.warn(`휴대폰 인증 실패`);
        throw new UnauthorizedException(`휴대폰 인증 실패`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async generalLogin(
    userLoginInputDto: UserLoginInputDto,
  ): Promise<UserLoginOutputDto> {
    const { user_id, password } = userLoginInputDto;
    const conn = getConnection();
    const [user] = await conn.query(
      `SELECT USER_ID, PASSWORD FROM USER WHERE USER_ID='${user_id}' AND STATUS='P' AND ROLE_ID=2;`,
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
         WHERE USER_ID='${user_id}' AND STATUS='P';`,
      );

      const loginObject = {
        statusCode: 201,
        message: '로그인 성공',
        accessToken: accessToken,
        refreshToken: refreshToken,
      };

      this.logger.verbose(`User ${user_id} 일반 로그인 성공
      Payload: ${JSON.stringify(loginObject)}`);

      return {
        statusCode: 201,
        message: '로그인 성공',
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } else {
      this.logger.warn(`User ${user_id} 일반 로그인 실패`);
      throw new UnauthorizedException('로그인 실패');
    }
  }

  async addUserProfile(
    user_id: string,
    profileDetailInputDto: ProfileDetailInputDto,
  ): Promise<ProfileDetailOutputDto> {
    const { name, birth, phone_num, address, detail_address, phone_verify } =
      profileDetailInputDto;

    if (phone_verify !== 'Y') {
      this.logger.warn(`휴대폰 인증 실패`);
      return Object.assign({
        statusCode: 406,
        message: '휴대폰 인증 실패',
      });
    }

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE USER_ID='${user_id}' AND STATUS='P' AND VERIFY='Y';`,
    );

    if (!found) {
      try {
        await conn.query(
          `UPDATE USER SET NAME='${name}', BIRTH='${birth}', PHONE_NUM='${phone_num}', ADDRESS='${address}', 
           DETAIL_ADDRESS='${detail_address}', VERIFY='Y', UPDATE_DT=NOW(), UPDATE_ID='${user_id}'
           WHERE USER_ID='${user_id}' AND STATUS='P';`,
        );
        this.logger.verbose(`User ${user_id} 회원 프로필 추가정보 등록 성공`);
        return {
          statusCode: 201,
          message: '회원 프로필 추가정보 등록 성공',
        };
      } catch (error) {
        this.logger.error(`회원 프로필 추가정보 등록 실패
        Error: ${error}`);
        if (error.code === 'ER_DUP_ENTRY') {
          throw new ConflictException(`${error.sqlMessage}`);
        } else {
          throw new InternalServerErrorException();
        }
      }
    } else {
      this.logger.verbose(`User ${user_id} 회원 프로필 추가정보 등록 실패`);
      throw new HttpException(
        '회원 프로필 추가정보가 등록된 회원 입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserProfile(user_id: string): Promise<SelectProfileOutputDto> {
    const conn = getConnection();
    const [user] = await conn.query(
      `SELECT NAME AS name, BIRTH AS birth, EMAIL AS email, PHONE_NUM AS phone_num, ADDRESS AS address, 
       DETAIL_ADDRESS AS detail_address, METHOD AS method, PROFILE_IMG AS profile_img, VERIFY AS verify FROM USER 
       WHERE USER_ID='${user_id}' AND STATUS='P';`,
    );

    if (user) {
      if (user.verify === 'Y') {
        delete user.verify;

        this.logger.verbose(`User ${user_id} 회원 프로필 조회 성공`);
        return {
          statusCode: 200,
          message: '회원 프로필 조회 성공',
          data: user,
        };
      }
      this.logger.verbose(`User ${user_id} 회원 프로필 조회 실패`);
      throw new HttpException(
        '회원 프로필 추가정보가 등록되지 않은 회원 입니다.',
        HttpStatus.NOT_FOUND,
      );
    } else {
      this.logger.verbose(`User ${user_id} 회원 프로필 조회 실패`);
      throw new HttpException('회원 프로필 조회 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async modifyUserProfile(
    user_id: string,
    modifyProfileDetailInputDto: ModifyProfileDetailInputDto,
  ): Promise<ModifyProfileDetailOutputDto> {
    const { name, birth, email, phone_num, address, detail_address } =
      modifyProfileDetailInputDto;
    const conn = getConnection();

    try {
      await conn.query(
        `UPDATE USER SET NAME='${name}', BIRTH='${birth}', EMAIL='${email}', PHONE_NUM='${phone_num}', 
         ADDRESS='${address}', DETAIL_ADDRESS='${detail_address}', UPDATE_DT=NOW(), UPDATE_ID='${user_id}'
         WHERE USER_ID='${user_id}' AND VERIFY='Y' AND STATUS='P';`,
      );

      this.logger.verbose(`User ${user_id} 회원 프로필 수정 성공`);
      return {
        statusCode: 201,
        message: '회원 프로필 수정 성공',
      };
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

  async modifyUserProfileImg(
    user_id: string,
    file: string,
  ): Promise<ModifyProfileImgOutputDto> {
    if (file) {
      const generatedFile = createImageURL(file);
      const conn = getConnection();

      await conn.query(
        `UPDATE USER SET PROFILE_IMG='${generatedFile}', UPDATE_DT=NOW(), UPDATE_ID='${user_id}'
          WHERE USER_ID='${user_id}' AND VERIFY='Y' AND STATUS='P';`,
      );

      this.logger.verbose(`User ${user_id} 회원 프로필 이미지 수정 성공`);
      return {
        statusCode: 201,
        message: '회원 프로필 이미지 수정 성공',
      };
    }

    this.logger.verbose(`User ${user_id} 회원 프로필 이미지 수정 실패`);
    throw new HttpException(
      '회원 프로필 이미지 수정 실패',
      HttpStatus.BAD_REQUEST,
    );
  }

  async userFollow(
    user_id: string,
    userFollowInputDto: UserFollowInputDto,
  ): Promise<UserFollowOutputDto> {
    const { follow_user_id } = userFollowInputDto;
    const conn = getConnection();

    const [found] = await conn.query(
      `SELECT USER_ID AS user_id FROM USER WHERE USER_ID='${follow_user_id}' AND STATUS='P' AND VERIFY='Y';`,
    );

    if (!found) {
      this.logger.verbose(`User ${user_id} 팔로우 ${follow_user_id} 실패`);
      throw new HttpException(
        '존재하지 않는 유저 입니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (user_id === found.user_id) {
      this.logger.verbose(`User ${user_id} 자기 자신을 팔로우 할 수 없습니다.`);
      throw new HttpException(
        '자기 자신을 팔로우 할 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const [existFollow] = await conn.query(
      `SELECT FOLLOW_YN AS follow_yn FROM FOLLOW WHERE USER_ID='${user_id}' AND FOLLOWING_USER_ID='${follow_user_id}';`,
    );

    if (existFollow) {
      let follow_yn = '';

      if (existFollow.follow_yn === 'Y') {
        follow_yn = 'N';
      } else {
        follow_yn = 'Y';
      }
      await conn.query(
        `UPDATE FOLLOW SET FOLLOW_YN='${follow_yn}', UPDATE_DT=NOW(), UPDATE_ID='${user_id}'
         WHERE USER_ID='${user_id}' AND FOLLOWING_USER_ID='${follow_user_id}';`,
      );

      if (existFollow.follow_yn === 'Y') {
        this.logger.verbose(`User ${user_id} 언팔로우 ${follow_user_id} 성공`);
        return {
          statusCode: 201,
          message: '언팔로우 성공',
          follow: 'unFollow',
        };
      } else {
        this.logger.verbose(`User ${user_id} 팔로우 ${follow_user_id} 성공`);
        return {
          statusCode: 201,
          message: '팔로우 성공',
          follow: 'follow',
        };
      }
    }
    const sql = `INSERT INTO FOLLOW(USER_ID, FOLLOWING_USER_ID, INSERT_DT, INSERT_ID)
                 VALUES(?,?,NOW(),?);`;
    const params = [user_id, follow_user_id, user_id];

    await conn.query(sql, params);

    this.logger.verbose(`User ${user_id} 팔로우 ${follow_user_id} 성공`);
    return {
      statusCode: 201,
      message: '팔로우 성공',
      follow: 'follow',
    };
  }

  async getUserFollowing(user_id: string): Promise<UserFollowwingOutputDto> {
    const conn = getConnection();
    const [count] = await conn.query(
      `SELECT COUNT(FOLLOW_ID) AS count FROM FOLLOW WHERE USER_ID='${user_id}' AND FOLLOW_YN='Y'`,
    );
    const following = await conn.query(
      `SELECT FOLLOWING_USER_ID AS following_user_id, NAME AS name, PROFILE_IMG AS profile_img, 
       COUNT(PRODUCT.USER_ID) AS product_count FROM FOLLOW INNER JOIN USER ON FOLLOW.FOLLOWING_USER_ID = USER.USER_ID 
       LEFT JOIN PRODUCT ON FOLLOW.FOLLOWING_USER_ID = PRODUCT.USER_ID AND DATE(PRODUCT.INSERT_DT) 
       BETWEEN DATE_ADD(CURDATE(), INTERVAL -1 DAY) AND CURRENT_DATE() AND USE_YN='Y'
       WHERE FOLLOW.USER_ID='${user_id}' AND FOLLOW.FOLLOW_YN='Y' GROUP BY following_user_id 
       ORDER BY name ASC;`,
    );

    if (count && following) {
      this.logger.verbose(`User ${user_id} 팔로잉 조회 성공`);
      return {
        statusCode: 200,
        message: '회원 팔로잉 조회 성공',
        user_count: parseInt(count.count),
        data: following,
      };
    }

    this.logger.verbose(`User ${user_id} 팔로잉 조회 실패`);
    throw new HttpException('회원 팔로잉 조회 실패', HttpStatus.BAD_REQUEST);
  }

  async getUserTopSeller(): Promise<UserTopSellerOutputDto> {
    const conn = getConnection();

    try {
      const found = await conn.query(`
      SELECT user_id, RANK() OVER (ORDER BY sold_count DESC, star_count DESC) AS ranking, hashtag, name, CAST(star_count AS CHAR) AS start_count, follower_count, 
      sold_count, profile_img FROM(SELECT USER.USER_ID AS user_id, 
      (SELECT AVG(STAR_COUNT) FROM REVIEW WHERE PRODUCT.USER_ID=REVIEW.PRODUCT_USER_ID AND REVIEW.USE_YN='Y') AS star_count,
      (SELECT COUNT(FOLLOW_ID) FROM FOLLOW WHERE PRODUCT.USER_ID=FOLLOW.FOLLOWING_USER_ID AND FOLLOW.FOLLOW_YN='Y') AS follower_count, 
      COUNT(*) AS sold_count, USER.NAME AS name, USER.HASHTAG AS hashtag, USER.PROFILE_IMG AS profile_img  
      FROM PRODUCT INNER JOIN USER ON PRODUCT.USER_ID = USER.USER_ID AND PRODUCT.USE_YN='Y' AND USER.STATUS='P' AND PRODUCT.PRODUCT_ST='500' 
      WHERE DATE(PRODUCT.INSERT_DT) BETWEEN LAST_DAY(NOW() - interval 1 MONTH) + interval 1 DAY AND LAST_DAY(NOW()) GROUP BY user_id)AS counts;`);

      this.logger.verbose(`이달의 탑 셀러 조회 성공`);
      return {
        statusCode: 200,
        message: '이달의 탑 셀러 조회 성공',
        data: found,
      };
    } catch (error) {
      this.logger.verbose(`이달의 탑 셀러 조회 실패\n ${error}`);
      throw new HttpException(
        '이달의 탑 셀러 조회 실패',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserTopSellerAuth(user_id: string) {
    const topSellerData: any = await this.getUserTopSeller();

    if (topSellerData.statusCode === 200) {
      const length = topSellerData.data.length;

      for (let i = 0; i < length; i++) {
        const follow_user_id = topSellerData.data[i].user_id;
        const existFollow = await this.followConfirmation(
          user_id,
          follow_user_id,
        );
        topSellerData.data[i].follow = existFollow;
      }
      this.logger.verbose(`이달의 탑 셀러 조회 성공`);
      return topSellerData;
    }
    this.logger.verbose(`이달의 탑 셀러 조회 실패\n`);
    throw new HttpException('이달의 탑 셀러 조회 실패', HttpStatus.BAD_REQUEST);
  }

  private async followConfirmation(user_id: string, follow_user_id: string) {
    const conn = getConnection();

    if (user_id === follow_user_id) {
      return 'me';
    }
    try {
      const [found] = await conn.query(
        `SELECT USER_ID AS user_id FROM FOLLOW 
         WHERE USER_ID='${user_id}' AND FOLLOWING_USER_ID='${follow_user_id}'
         AND FOLLOW_YN='Y';`,
      );
      if (!found) {
        return 'notFollow';
      }

      return 'following';
    } catch (error) {
      this.logger.verbose(`팔로우 여부 조회 실패\n ${error}`);
      throw new HttpException('팔로우 여부 조회 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async userLogout(user_id: string): Promise<UserLogoutOutputDto> {
    const conn = getConnection();

    try {
      await conn.query(
        `UPDATE USER SET REFRESH_TOKEN=NULL, UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
         WHERE USER_ID='${user_id}' AND status='P';`,
      );

      this.logger.verbose(`User ${user_id} 회원 로그아웃 성공`);
      return {
        statusCode: 200,
        message: '회원 로그아웃 성공',
      };
    } catch (error) {
      this.logger.verbose(`User ${user_id} 회원 로그아웃 실패\n ${error}`);
      throw new HttpException('회원 로그아웃 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async userWithdrawal(user_id: string): Promise<UserWithdrawalOutputDto> {
    const conn = getConnection();

    try {
      await conn.query(
        `UPDATE USER SET STATUS='D', NAME=NULL, PHONE_NUM=NULL, EMAIL=NULL, 
         UPDATE_DT=NOW(), UPDATE_ID='${user_id}', PROFILE_IMG=NULL, REFRESH_TOKEN=NULL 
         WHERE USER_ID='${user_id}' AND STATUS='P';`,
      );

      this.logger.verbose(`User ${user_id} 회원 탈퇴 성공`);
      return {
        statusCode: 200,
        message: '회원 탈퇴 성공',
      };
    } catch (error) {
      this.logger.verbose(`User ${user_id} 회원 탈퇴 실패\n ${error}`);
      throw new HttpException('회원 탈퇴 실패', HttpStatus.BAD_REQUEST);
    }
  }
}
