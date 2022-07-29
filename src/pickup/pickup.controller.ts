import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
}
