import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

//상품 등록 Input 데이터
export class ProductRegistationInputDto {
  @ApiProperty({ example: '이름', description: '상품 제목' })
  @IsNotEmpty()
  tile: string;

  @ApiProperty({ example: '설명', description: '상품 설명' })
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 2000, description: '상품 가격' })
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    name: 'product',
    required: false,
    description: '이미지',
  })
  product_img: string;
}

//상품 등록 Output 데이터
export class ProductRegistationOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '상품 등록 성공',
    description: '설명',
  })
  message: string;
}
