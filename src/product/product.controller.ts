import {
  Body,
  Controller,
  Get,
  Param,
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
import {
  ProductWishInputDto,
  ProductWishOutputDto,
  ProductWishSelectOutputDto,
} from './dto/pruduct.wish.dto';
import { ProductFollowOutputDto } from './dto/product.follow.dto';

@ApiTags('상품 API')
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  //팔로우 상품 조회
  @Get('follow/select')
  @ApiOperation({
    summary: '팔로우 상품 최신순 조회 API(완료)',
    description: '팔로우 한 유저 상품 최신순 조회 입니다. 토큰 값 필수!',
  })
  @ApiOkResponse({
    description: '팔로우 상품 최신순 조회 성공',
    type: ProductFollowOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '팔로우 상품 최신순 조회 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async getProductFollow(@Req() req) {
    return await this.productService.getProductFollow(req.user);
  }

  //상품 최신순 조회
  @Get('latest/select')
  @ApiOperation({
    summary: '상품 최신순 조회 API(1차 완료)',
    description: '상품을 최신순으로 최대 14개까지 조회합니다.',
  })
  @ApiOkResponse({
    description: '상품 최신순 조회 성공',
    type: ProductLatestOutputDto,
  })
  @ApiResponse({
    status: 404,
    description: '상품 최신순 조회 실패',
  })
  async getProductLatest(): Promise<ProductLatestOutputDto> {
    return await this.productService.getProductLatest();
  }

  //상품 찜 등록 / 찜 해제
  @Post('wish/:product_id')
  @ApiOperation({
    summary: '상품 찜 등록 / 찜 해제 API(완료)',
    description: '상품 찜 등록 / 짐 해제 입니다. 토큰 값 필수!',
  })
  @ApiResponse({
    status: 201,
    type: ProductWishOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Error: Bad Request',
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 상품 입니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async productWish(
    @Req() req,
    @Param(ValidationPipe) productWishInputDto: ProductWishInputDto,
  ): Promise<ProductWishOutputDto> {
    return await this.productService.productWish(req.user, productWishInputDto);
  }

  //상품 찜 조회
  @Get('wish/select')
  @ApiOperation({
    summary: '상품 찜 조회 API(완료)',
    description: '상품 찜 조회 입니다. 토큰 값 필수!',
  })
  @ApiOkResponse({
    description: '상품 찜 조회 성공',
    type: ProductWishSelectOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '상품 찜 조회 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async getProductWish(@Req() req): Promise<ProductWishSelectOutputDto> {
    return await this.productService.getProductWish(req.user);
  }

  //상품 등록
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
  @UseInterceptors(FileInterceptor('product', multerOptions))
  async registrationProduct(
    @Req() req,
    @UploadedFile() file: string,
    @Body(ValidationPipe)
    productRegistationInputDto: ProductRegistationInputDto,
  ): Promise<ProductRegistationOutputDto> {
    return await this.productService.registrationProduct(
      req.user,
      file,
      productRegistationInputDto,
    );
  }
}
