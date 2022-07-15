import { ApiProperty } from '@nestjs/swagger';

//상품 최신순 데이터
export class ProductLatestDto {
  @ApiProperty({ example: 1, description: '상품 아이디' })
  product_id: number;
  @ApiProperty({ example: 'M', description: '상품 사이즈' })
  size: string;
  @ApiProperty({ example: 2000, description: '상품 가격' })
  price: number;
  @ApiProperty({ example: 'secondlife.jpg', description: '상품 이미지' })
  product_img: string;
}

//상품 최신순 조회 Output 데이터
export class ProductLatestOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '상품 최신순 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty()
  data: ProductLatestDto;
}
