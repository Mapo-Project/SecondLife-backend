import {
  Body,
  Controller,
  Get,
  Post,
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
import { multerOptions } from 'src/user/multerOptions';
import {
  ProductRegistationInputDto,
  ProductRegistationOutputDto,
} from './dto/product.registration.dto';
import { ProductLatestOutputDto } from './dto/product.latest.dto';
import { ProductService } from './product.service';

@ApiTags('상품 API')
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post('registration')
  @ApiOperation({
    summary: '상품 등록 API(1차 완료)',
    description: '상품 등록 API 입니다. 토크값 필수!',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '등록할 상품 정보',
    type: ProductRegistationInputDto,
  })
  @ApiResponse({
    status: 201,
    description: '상품 등록 성공',
    type: ProductRegistationOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '상품 등록 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiResponse({
    status: 404,
    description: '지원하지 않는 이미지 형식',
  })
  @ApiResponse({
    status: 413,
    description: '파일크기 제한',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('product', multerOptions))
  async registrationProduct(
    @Req() req,
    @UploadedFile() file: string,
    @Body(ValidationPipe)
    productRegistationInputDto: ProductRegistationInputDto,
  ) {
    return await this.productService.registrationProduct(
      req.user,
      file,
      productRegistationInputDto,
    );
  }

  @Get('select/latest')
  @ApiOperation({
    summary: '상품 최신순 조회(완료)',
    description: '상품을 최신순으로 최대 14개까지 조회합니다.',
  })
  @ApiOkResponse({
    description: '상품 최신순 조회 성공',
    type: ProductLatestOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '상품 최신순 조회 실패',
  })
  async getProductLatest() {
    return await this.productService.getProductLatest();
  }
}
