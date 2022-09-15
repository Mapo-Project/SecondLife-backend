import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

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

//픽업 장소 데이터
export class PickupPlaceDto {
  @ApiProperty({
    example: '서울시 마포구 성산로 4길 53 1층',
    description: '주소',
  })
  address: string;
}

//픽업 장소 조회 Output 데이터
export class PickupPlaceSelectOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '픽업 장소 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({ type: [PickupPlaceDto] })
  data: PickupPlaceDto;
}

//픽업 장소 삭제 Input 데이터
export class PickupPlaceDeleteInputDto {
  @ApiProperty({
    name: 'pick_up_loc_id',
    description: '픽업 장소 삭제할 아이디',
    example: '1',
  })
  @IsNotEmpty()
  @IsNumberString()
  pick_up_loc_id: string;
}

//픽업 장소 삭제 Output 데이터
export class PickupPlaceDeleteOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '픽업 장소 삭제 성공',
    description: '설명',
  })
  message: string;
}
