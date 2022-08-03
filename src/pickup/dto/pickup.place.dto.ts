import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

//픽업 장소 등록 Input 데이터
export class PickupPlaceRegistrationInputDto {
  @ApiProperty({
    example: '서울시 마포구 성산로 4길 53 1층',
    description: '주소',
  })
  @IsNotEmpty()
  @IsString()
  address: string;
}

//픽업 장소 등록 Output 데이터
export class PickupPlaceRegistrationOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '픽업 장소 등록 성공',
    description: '설명',
  })
  message: string;
}
