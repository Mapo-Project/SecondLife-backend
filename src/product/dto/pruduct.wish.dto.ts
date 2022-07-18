import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

//상품 찜 등록 / 찜 해제 Input 데이터
export class ProductWishInputDto {
  @ApiProperty({
    name: 'product_id',
    description: '찜 등록 / 찜 해제 할 상품 아이디',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumberString()
  product_id: number;
}

//상품 찜 등록 / 찜 해제 Output 데이터
export class ProductWishOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '상품 찜 등록 | 상품 찜 해제 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({
    example: 'wish | unWish',
    description: '찜 여부',
  })
  wish: 'wish' | 'unWish';
}
