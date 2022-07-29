import { ApiProperty } from '@nestjs/swagger';

//상품 등록 Output 데이터
export class PickupRequestInputDto {
  @ApiProperty({ example: 1, description: '픽업 신청 할 옷 갯수' })
  clothes_num: number;

  @ApiProperty({ example: 'M', description: '그린 백 사이즈' })
  green_bag_size: string;
}

//상품 등록 Output 데이터
export class PickupRequestOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '픽업 신청 성공',
    description: '설명',
  })
  message: string;
}
