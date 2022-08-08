import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

//픽업 신청 Input 데이터
export class PickupRequestInputDto {
  @ApiProperty({ example: 3, description: '픽업 갯수' })
  @IsNotEmpty()
  @IsNumber()
  pick_up_num: number;

  @ApiProperty({
    example: '서울시 마포구 성산로 4길 53 1층',
    description: '주소',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: 1, description: '그린백 스몰 갯수' })
  @IsNumber()
  green_bag_s: number;

  @ApiProperty({ example: 1, description: '그린백 미디움 갯수' })
  @IsNumber()
  green_bag_m: number;

  @ApiProperty({ example: 1, description: '그린백 라지 갯수' })
  @IsNumber()
  green_bag_l: number;

  @ApiProperty({ example: '01', description: '그린백 정리 방법(공통코드)' })
  @IsNotEmpty()
  method_org: string;

  @ApiProperty({ example: '7월 14일', description: '픽업 날짜' })
  @IsNotEmpty()
  pick_up_dt: string;

  @ApiProperty({ example: '01', description: '그린백 픽업 시간(공통코드)' })
  @IsNotEmpty()
  pick_up_tm: string;

  @ApiProperty({ example: 'Y', description: '그린백 유무' })
  @IsNotEmpty()
  green_bag_yn: string;
}

//픽업 신청 Output 데이터
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

//픽업 신청 데이터
export class PickupRequestDto {
  @ApiProperty({
    example: '423d540c-e444-4c39-8db8-ec6bba4a2ce3',
    description: '픽업 아이디',
  })
  pick_up_id: string;

  @ApiProperty({ example: 3, description: '픽업 물품 수량' })
  pick_up_num: number;

  @ApiProperty({
    example: '서울시 마포구 성산로 4길 53 1층',
    description: '주소',
  })
  address: string;

  @ApiProperty({ example: '', description: '정리법' })
  method_organizing: string;
}

//픽업 신청 조회 Output 데이터
export class PickupRequestSelectOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '픽업 신청 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({ type: [PickupRequestDto] })
  data: PickupRequestDto;
}
