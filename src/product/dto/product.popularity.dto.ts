import { ApiProperty } from '@nestjs/swagger';

//인기 상품 데이터
export class ProductPopularityDto {
  @ApiProperty({ example: 1, description: '상품 아이디' })
  product_id: number;
  @ApiProperty({ example: '2', description: '상품 찜 수' })
  wish_count: string;
  @ApiProperty({ example: 'M', description: '상품 사이즈' })
  size: string;
  @ApiProperty({ example: 2000, description: '상품 가격' })
  price: number;
  @ApiProperty({ example: 'secondlife.jpg', description: '상품 이미지' })
  product_img: string;
}

//인기 있는 상품 조회 Output 데이터
export class ProductPopularityOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '인기 상품 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({ type: [ProductPopularityDto] })
  data: ProductPopularityDto;
}
