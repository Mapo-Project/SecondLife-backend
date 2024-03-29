import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserSocialLoginOutputDto } from 'src/user/dto/user.login.dto';
import { AuthService } from './auth.service';
import {
  AccessTokenReissuanceInputDto,
  AccessTokenReissuanceOutputDto,
} from './dto/acess.token.dto';
import { UserDto } from './dto/user.dto';

@ApiTags('인증 API')
@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private authService: AuthService) {}

  @Get('login')
  @ApiOperation({
    summary: '로그인 페이지(테스트)',
    description: `로그인 페이지 주소 입니다.  
    
    https://cozy-rabanadas-e9e588.netlify.app`,
  })
  @Header('Content-Type', 'text/html')
  getLoginPage(): string {
    return `
      <div>
        <h1>카카오 로그인</h1>

        <form action="kakao" method="GET">
          <input type="submit" value="카카오로그인" />
        </form>

        <h1>구글 로그인</h1>

        <form action="google" method="GET">
          <input type="submit" value="구글로그인" />
        </form>
      </div>
    `;
  }

  @Get('kakao')
  @ApiOperation({
    summary: '카카오 로그인(완료)',
    description: `카카오 로그인 페이지로 이동 합니다.`,
  })
  @HttpCode(200)
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth() {
    return HttpStatus.OK;
  }

  @Get('kakao/callback')
  @ApiOperation({
    summary: '카카오 로그인 콜백(완료)',
    description: '카카오 로그인시 콜백 라우터입니다.',
  })
  @ApiResponse({
    description: '로그인 성공',
    type: UserSocialLoginOutputDto,
  })
  @UseGuards(AuthGuard('kakao'))
  async kakaoCallBack(
    @Req() req,
    @Res() res,
  ): Promise<UserSocialLoginOutputDto> {
    const user = await this.authService.loginCallBack(req.user as UserDto);
    this.logger.verbose(`User ${req.user.social_id} 카카오 로그인 성공
    Payload: ${JSON.stringify(user)}`);

    return res.redirect(
      `${process.env.FRONT_URL}?user=${JSON.stringify(user)}`,
    );
  }

  @Get('google')
  @ApiOperation({
    summary: '구글 로그인(완료)',
    description: `구글 로그인 페이지로 이동 합니다.`,
  })
  @HttpCode(200)
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return HttpStatus.OK;
  }

  @Get('google/callback')
  @ApiOperation({
    summary: '구글 로그인 콜백(완료)',
    description: '구글 로그인시 콜백 라우터입니다.',
  })
  @ApiResponse({
    description: '로그인 성공',
    type: UserSocialLoginOutputDto,
  })
  @UseGuards(AuthGuard('google'))
  async googleCallBack(
    @Req() req,
    @Res() res,
  ): Promise<UserSocialLoginOutputDto> {
    const user = await this.authService.loginCallBack(req.user as UserDto);
    this.logger.verbose(`User ${req.user.social_id} 구글 로그인 성공
    Payload: ${JSON.stringify(user)}`);

    return res.redirect(
      `${process.env.FRONT_URL}?user=${JSON.stringify(user)}`,
    );
  }

  @Post('token/reissuance')
  @ApiBody({
    type: AccessTokenReissuanceInputDto,
    description: '리프레시 토큰 값',
  })
  @ApiOperation({
    summary: 'accessToken 재발급 API(완료)',
    description: 'accessToken 재발급 요청',
  })
  @ApiOkResponse({
    description: 'accessToken 재발급 성공',
    type: AccessTokenReissuanceOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'accessToken 재발급 실패',
  })
  async accessTokenReissuance(
    @Body(ValidationPipe)
    accessTokenReissuanceInputDto: AccessTokenReissuanceInputDto,
  ): Promise<AccessTokenReissuanceOutputDto> {
    return await this.authService.accessTokenReissuance(
      accessTokenReissuanceInputDto,
    );
  }
}
