import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  PickupPlaceRegistrationInputDto,
  PickupPlaceRegistrationOutputDto,
  PickupPlaceSelectOutputDto,
} from './dto/pickup.place.dto';
import {
  PickupRequestInputDto,
  PickupRequestOutputDto,
} from './dto/pickup.request.dto';
import { PickupService } from './pickup.service';

@ApiTags('픽업 API')
@Controller('pickup')
export class PickupController {
  constructor(private pickupService: PickupService) {}

  //픽업 신청
  @Post('request')
  @ApiOperation({
    summary: '픽업 신청 API()',
    description: '픽업 신청 입니다. 토큰 값 필수!',
  })
  @ApiBody({
    description: '등록할 상품 정보',
    type: PickupRequestInputDto,
  })
  @ApiResponse({
    status: 201,
    description: '픽업 신청 성공',
    type: PickupRequestOutputDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiResponse({
    status: 400,
    description: '픽업 신청 실패',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async pickupRequest(
    @Req() req,
    @Body(ValidationPipe)
    pickupRequestInputDto: PickupRequestInputDto,
  ) {
    return await this.pickupService.pickupRequest(
      req.user,
      pickupRequestInputDto,
    );
  }

  //픽업 장소 등록
  @Post('place/registration')
  @ApiOperation({
    summary: '픽업 장소 등록 API(완료)',
    description: '픽업 장소 등록 입니다. 토큰 값 필수!',
  })
  @ApiBody({
    description: '등록할 픽업 장소 정보',
    type: PickupPlaceRegistrationInputDto,
  })
  @ApiResponse({
    status: 201,
    description: '픽업 장소 등록 성공',
    type: PickupPlaceRegistrationOutputDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiResponse({
    status: 400,
    description: '픽업 장소 등록 실패',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async pickupPlaceRegistration(
    @Req() req,
    @Body(ValidationPipe)
    pickupPlaceRegistrationInputDto: PickupPlaceRegistrationInputDto,
  ): Promise<PickupPlaceRegistrationOutputDto> {
    return await this.pickupService.pickupPlaceRegistration(
      req.user,
      pickupPlaceRegistrationInputDto,
    );
  }

  //픽업 장소 조회
  @Get('place/select')
  @ApiOperation({
    summary: '픽업 장소 조회 API(완료)',
    description: '픽업 장소 조회 입니다. 토큰 값 필수!',
  })
  @ApiOkResponse({
    description: '픽업 장소 조회 성공',
    type: PickupPlaceSelectOutputDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiResponse({
    status: 400,
    description: '픽업 장소 조회 실패',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async getPickupPlace(@Req() req): Promise<PickupPlaceSelectOutputDto> {
    return await this.pickupService.getPickupPlace(req.user);
  }
}
