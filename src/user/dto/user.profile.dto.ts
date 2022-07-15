import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

//회원 프로필 등록 Input 데이터
export class ProfileDetailInputDto {
  @ApiProperty({ example: 'name', description: '이름' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1111-01-01', description: '생년월일' })
  @IsNotEmpty()
  birth: string;

  @ApiProperty({ example: '01033337777', description: '휴대폰 번호' })
  @IsNotEmpty()
  phone_num: string;

  @ApiProperty({
    example: '서울특별시 마포구 성산로 4길 53',
    description: '주소',
  })
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '마포구청사 제3별관', description: '상세주소' })
  @IsNotEmpty()
  detail_address: string;

  @ApiProperty({ example: 'Y', description: '휴대폰 인증 여부' })
  @IsNotEmpty()
  phone_verify: string;
}

//회원 프로필 등록 Output 데이터
export class ProfileDetailOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 프로필 추가정보 등록 성공',
    description: '설명',
  })
  message: string;
}

//회원 프로필 데이터
export class ProfileDetailDto {
  @ApiProperty({ example: 'name', description: '이름' })
  name: string;

  @ApiProperty({ example: '1111-01-01', description: '생년월일' })
  birth: string;

  @ApiProperty({ example: 'email@secondLife.com', description: '이메일' })
  email: string;

  @ApiProperty({ example: '01033337777', description: '휴대폰 번호' })
  phone_num: string;

  @ApiProperty({
    example: '서울특별시 마포구 성산로 4길 53',
    description: '주소',
  })
  address: string;

  @ApiProperty({ example: '마포구청사 제3별관', description: '상세주소' })
  detail_address: string;

  @ApiProperty({ example: 'kakao', description: 'sns유형' })
  method: string;

  @ApiProperty({ example: 'img', description: '프로필사진' })
  profile_img: string;
}

//회원 프로필 조회 Output 데이터
export class SelectProfileOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 프로필 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty()
  data: ProfileDetailDto;
}

//회원 프로필 수정 Input 데이터
export class ModifyProfileDetailInputDto {
  @ApiProperty({ example: 'name', description: '이름' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1111-01-01', description: '생년월일' })
  @IsNotEmpty()
  birth: string;

  @ApiProperty({ example: 'email@secondLife.com', description: '이메일' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '01033337777', description: '휴대폰 번호' })
  @IsNotEmpty()
  phone_num: string;

  @ApiProperty({
    example: '서울특별시 마포구 성산로 4길 53',
    description: '주소',
  })
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '마포구청사 제3별관', description: '상세주소' })
  @IsNotEmpty()
  detail_address: string;
}

//회원 프로필 수정 Output 데이터
export class ModifyProfileDetailOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 프로필 수정 성공',
    description: '설명',
  })
  message: string;
}

//회원 프로필 이미지 수정 Input 데이터
export class ModifyProfileImgInputDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    name: 'profile',
    required: false,
  })
  @IsNotEmpty()
  profile_img: string;
}

//회원 프로필 이미지 수정 Output 데이터
export class ModifyProfileImgOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 프로필 이미지 수정 성공',
    description: '설명',
  })
  message: string;
}
