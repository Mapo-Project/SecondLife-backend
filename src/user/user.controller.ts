import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  UserAuthPhoneInputDto,
  UserAuthPhoneOutputDto,
} from './dto/user.auth.dto';
import {
  UserIdDuplicateInputDto,
  UserIdDuplicateOutputDto,
} from './dto/user.duplicate.dto';
import {
  UserFindIdInputDto,
  UserFindIdOutputDto,
} from './dto/user.find.id.dto';
import {
  UserFollowInputDto,
  UserFollowOutputDto,
  UserFollowwingOutputDto,
} from './dto/user.follow.dto';
import { UserLoginInputDto, UserLoginOutputDto } from './dto/user.login.dto';
import { UserLogoutOutputDto } from './dto/user.logout.dto';
import {
  PasswordChangeInputDto,
  PasswordChangeOutputDto,
  PasswordTestInputDto,
} from './dto/user.password.dto';
import {
  ModifyProfileDetailInputDto,
  ModifyProfileDetailOutputDto,
  ModifyProfileImgOutputDto,
  ProfileDetailInputDto,
  ProfileDetailOutputDto,
  SelectProfileOutputDto,
} from './dto/user.profile.dto';
import { UserSignupInputDto, UserSignupOutputDto } from './dto/user.signup.dto';
import { UserWithdrawalOutputDto } from './dto/user.withdrawal.dto';
import { multerOptions } from './multerOptions';
import { UserService } from './user.service';

@ApiTags('유저 API')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  //일반회원 아이디 중복체크
  @Get('general/duplicate/id/:user_id')
  @ApiOperation({
    summary: '일반회원 아이디 중복체크 API(완료)',
    description: '회원 아이디 입력',
  })
  @ApiOkResponse({
    description: '아이디 중복체크 조회 성공',
    type: UserIdDuplicateOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request(user_id should not be empty)',
  })
  async userIdDuplicate(
    @Param(ValidationPipe) userIdDuplicateInputDto: UserIdDuplicateInputDto,
  ): Promise<UserIdDuplicateOutputDto> {
    return await this.userService.userIdDuplicate(userIdDuplicateInputDto);
  }

  //일반 회원가입 휴대폰 인증
  @Get('general/signup/auth/phone/:phone_number')
  @ApiOperation({
    summary: '일반 회원가입 휴대폰 인증 API(완료)',
    description: `회원 휴대폰 번호 입력
    
    테스트 할 시 테스트용 api 이용해 주세요 요금..`,
  })
  @ApiOkResponse({
    description: '인증번호',
    type: UserAuthPhoneOutputDto,
  })
  @ApiResponse({
    status: 409,
    description: '등록된 휴대폰 번호가 존재합니다.',
  })
  async userGeneralSignupAuthPhone(
    @Param(ValidationPipe) userAuthPhoneInputDto: UserAuthPhoneInputDto,
  ): Promise<UserAuthPhoneOutputDto> {
    return await this.userService.userGeneralSignupAuthPhone(
      userAuthPhoneInputDto,
    );
  }

  //소셜 회원가입 휴대폰 인증
  @Get('social/signup/auth/phone/:phone_number')
  @ApiOperation({
    summary: '소셜 회원가입 휴대폰 인증 API(완료)',
    description: `회원 휴대폰 번호 입력
      
      테스트 할 시 테스트용 api 이용해 주세요 요금..`,
  })
  @ApiOkResponse({
    description: '인증번호',
    type: UserAuthPhoneOutputDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  async userSocialSignupAuthPhone(
    @Req() req,
    @Param(ValidationPipe) userAuthPhoneInputDto: UserAuthPhoneInputDto,
  ): Promise<UserAuthPhoneOutputDto> {
    return await this.userService.userSocialSignupAuthPhone(
      req.user,
      userAuthPhoneInputDto,
    );
  }

  //일반 회원가입 휴대폰 인증(테스트용)
  @Get('general/signup/auth/phone/test/:phone_number')
  @ApiOperation({
    summary: '일반 회원가입 휴대폰 인증 API(테스트용)',
    description: `회원 휴대폰 번호 입력`,
  })
  @ApiOkResponse({
    description: '인증번호',
    type: UserAuthPhoneOutputDto,
  })
  @ApiResponse({
    status: 409,
    description: '등록된 휴대폰 번호가 존재합니다.',
  })
  async userGeneralSignupAuthPhoneTest(
    @Param(ValidationPipe) userAuthPhoneInputDto: UserAuthPhoneInputDto,
  ): Promise<UserAuthPhoneOutputDto> {
    return await this.userService.userGeneralSignupAuthPhoneTest(
      userAuthPhoneInputDto,
    );
  }

  //소셜 회원가입 휴대폰 인증(테스트용)
  @Get('social/signup/auth/phone/test/:phone_number')
  @ApiOperation({
    summary: '소셜 회원가입 휴대폰 인증 API(테스트용)',
    description: `회원 휴대폰 번호 입력`,
  })
  @ApiOkResponse({
    description: '인증번호',
    type: UserAuthPhoneOutputDto,
  })
  @ApiResponse({
    status: 409,
    description: '등록된 휴대폰 번호가 존재합니다.',
  })
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  async userSocialSignupAuthPhoneTest(
    @Req() req,
    @Param(ValidationPipe) userAuthPhoneInputDto: UserAuthPhoneInputDto,
  ): Promise<UserAuthPhoneOutputDto> {
    return await this.userService.userSocialSignupAuthPhoneTest(
      req.user,
      userAuthPhoneInputDto,
    );
  }

  //비밀번호 1차 암호화(프론트 테스트용)
  @Get('general/password/test')
  @ApiOperation({ summary: '비밀번호 1차 암호화(프론트 테스트용)' })
  async passwordFirstTest(
    @Query(ValidationPipe) passwordTestInputDto: PasswordTestInputDto,
  ) {
    return await this.userService.passwordFirstTest(passwordTestInputDto);
  }

  //일반 회원 아이디 찾기
  @Get('general/find/id')
  @ApiOperation({
    summary: '일반 회원 아이디 찾기 API(완료)',
    description: '일반 회원 아이디 찾기 입니다. 유저 닉네임, 이메일 정보 필수!',
  })
  @ApiOkResponse({
    description: '일반 회원 아이디 조회 성공',
    type: UserFindIdOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '가입된 회원정보가 없습니다.',
  })
  async getFindUserId(
    @Query(ValidationPipe)
    userFindIdInputDto: UserFindIdInputDto,
  ): Promise<UserFindIdOutputDto> {
    return await this.userService.getFindUserId(userFindIdInputDto);
  }

  //일반 회원 비밀번호 변경
  @Post('general/change/password')
  @ApiOperation({
    summary: '일반 회원 비밀번호 변경 API(완료)',
    description: '일반 회원 비밀번호 변경 입니다. 토큰 값 필수!',
  })
  @ApiBody({
    description: '변경할 비밀번호',
    type: PasswordChangeInputDto,
  })
  @ApiResponse({
    status: 201,
    description: '일반 회원 비밀번호 변경 성공',
    type: PasswordChangeOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '일반 회원 비밀번호 변경 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiResponse({
    status: 404,
    description: '변경할 비밀번호가 기존 비밀번호와 동일',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async generalChangePassword(
    @Req() req,
    @Body(ValidationPipe)
    passwordChangeInputDto: PasswordChangeInputDto,
  ): Promise<PasswordChangeOutputDto> {
    return await this.userService.generalChangePassword(
      req.user,
      passwordChangeInputDto,
    );
  }

  //일반 회원가입
  @Post('general/signup')
  @ApiOperation({
    summary: '일반 회원가입 API(완료)',
    description: '일반 회원가입 입니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '유저 정보',
    type: UserSignupInputDto,
  })
  @ApiResponse({
    status: 201,
    description: '일반 회원가입 성공',
    type: UserSignupOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Error: Bad Request',
  })
  @ApiResponse({
    status: 401,
    description: '휴대폰 인증 실패',
  })
  @ApiResponse({
    status: 409,
    description: '중복된 entry가 존재합니다.',
  })
  @ApiResponse({
    status: 413,
    description: '파일크기 제한',
  })
  @UseInterceptors(FileInterceptor('profile', multerOptions))
  async generalSignUp(
    @Body(ValidationPipe)
    userSignupInputDto: UserSignupInputDto,
    @UploadedFile() file: string,
  ): Promise<UserSignupOutputDto> {
    return await this.userService.generalSignUp(userSignupInputDto, file);
  }

  //일반 회원 로그인
  @Post('general/signin')
  @ApiOperation({
    summary: '일반 회원 로그인 API(완료)',
    description: '일반 회원 로그인 입니다. 1차 암호화 비밀번호 필요!',
  })
  @ApiBody({ description: '유저 정보', type: UserLoginInputDto })
  @ApiResponse({
    status: 201,
    description: '로그인 성공',
    type: UserLoginOutputDto,
  })
  @ApiResponse({
    status: 401,
    description: '로그인 실패',
  })
  async generalLogin(
    @Body(ValidationPipe) userLoginInputDto: UserLoginInputDto,
  ): Promise<UserLoginOutputDto> {
    return await this.userService.generalLogin(userLoginInputDto);
  }

  //회원 프로필 추가
  @Post('profile/add')
  @ApiOperation({
    summary: '회원 프로필 추가 API(1차 완료)',
    description: '회원 프로필 추가정보 입력 입니다. 토큰 값 필수!',
  })
  @ApiBody({
    description: '추가할 프로필 정보',
    type: ProfileDetailInputDto,
  })
  @ApiResponse({
    status: 201,
    description: '회원 프로필 추가정보 등록 성공',
    type: ProfileDetailOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '회원 프로필 추가정보가 등록된 회원 입니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiResponse({
    status: 409,
    description: '중복된 entry가 존재합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async addUserProfile(
    @Req() req,
    @Body(ValidationPipe) profileDetailInputDto: ProfileDetailInputDto,
  ): Promise<ProfileDetailOutputDto> {
    return await this.userService.addUserProfile(
      req.user,
      profileDetailInputDto,
    );
  }

  //회원 프로필 조회
  @Get('profile/select')
  @ApiOperation({
    summary: '회원 프로필 조회 API(1차 완료)',
    description: '회원 프로필 조회 입니다. 토큰 값 필수!',
  })
  @ApiOkResponse({
    description: '회원 프로필 조회 성공',
    type: SelectProfileOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '회원 프로필 조회 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async getUserProfile(@Req() req): Promise<SelectProfileOutputDto> {
    return await this.userService.getUserProfile(req.user);
  }

  //회원 프로필 수정
  @Post('profile/modify')
  @ApiOperation({
    summary: '회원 프로필 수정 API(1차 완료)',
    description: '회원 프로필 수정 입니다. 토큰 값 필수!',
  })
  @ApiBody({
    description: '수정할 프로필 정보',
    type: ModifyProfileDetailInputDto,
  })
  @ApiResponse({
    status: 201,
    description: '회원 프로필 수정 성공',
    type: ModifyProfileDetailOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request(should not be empty)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiResponse({
    status: 409,
    description: '중복된 entry가 존재합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async modifyUserProfile(
    @Req() req,
    @Body(ValidationPipe)
    modifyProfileDetailInputDto: ModifyProfileDetailInputDto,
  ): Promise<ModifyProfileDetailOutputDto> {
    return await this.userService.modifyUserProfile(
      req.user,
      modifyProfileDetailInputDto,
    );
  }

  //회원 프로필 이미지 수정
  @Post('profile/modify/img')
  @ApiOperation({
    summary: '회원 프로필 이미지 수정 API(완료)',
    description: '회원 프로필 이미지 수정 입니다. 토큰 값 필수!',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '등록 할 이미지 파일',
    schema: {
      type: 'object',
      properties: {
        profile: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '회원 프로필 이미지 수정 성공',
    type: ModifyProfileImgOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Error: Bad Request',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiResponse({
    status: 413,
    description: '파일크기 제한',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('profile', multerOptions))
  async modifyUserProfileImg(
    @Req() req,
    @UploadedFile() file: string,
  ): Promise<ModifyProfileImgOutputDto> {
    return await this.userService.modifyUserProfileImg(req.user, file);
  }

  //회원 팔로우 / 언팔로우
  @Post('follow/:follow_user_id')
  @ApiOperation({
    summary: '팔로우 / 언팔로우 API(완료)',
    description: '회원 팔로우 / 언팔로우 입니다. 토큰 값 필수!',
  })
  @ApiResponse({
    status: 201,
    type: UserFollowOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '자기 자신을 팔로우 할 수 없습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 유저입니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async userFollow(
    @Req() req,
    @Param(ValidationPipe) userFollowInputDto: UserFollowInputDto,
  ): Promise<UserFollowOutputDto> {
    return await this.userService.userFollow(req.user, userFollowInputDto);
  }

  //회원 팔로잉 조회
  @Get('following/select')
  @ApiOperation({
    summary: '회원 팔로잉 조회 API(완료)',
    description: '회원 팔로잉 조회 입니다. 토큰 값 필수!',
  })
  @ApiOkResponse({
    description: '회원 팔로잉 조회 성공',
    type: UserFollowwingOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '회원 팔로잉 조회 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async getUserFollowing(@Req() req): Promise<UserFollowwingOutputDto> {
    return await this.userService.getUserFollowing(req.user);
  }

  //회원 로그아웃
  @Get('/logout')
  @ApiOperation({
    summary: '회원 로그아웃 API(완료)',
    description: '회원 로그아웃 입니다. 토큰 값 필수!',
  })
  @ApiOkResponse({
    description: '회원 로그아웃 성공',
    type: UserLogoutOutputDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async userLogout(@Req() req): Promise<UserLogoutOutputDto> {
    return await this.userService.userLogout(req.user);
  }

  //회원 탈퇴
  @Delete('/withdrawal')
  @ApiOperation({
    summary: '회원 탈퇴 API(완료)',
    description: '회원 탈퇴 입니다. 토큰 값 필수!',
  })
  @ApiOkResponse({
    description: '회원 탈퇴 성공',
    type: UserWithdrawalOutputDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async userWithdrawal(@Req() req): Promise<UserWithdrawalOutputDto> {
    return await this.userService.userWithdrawal(req.user);
  }
}
