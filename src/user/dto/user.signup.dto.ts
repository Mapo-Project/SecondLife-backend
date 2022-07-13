import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

//일반 회원가입 Input 데이터
export class UserSignupInputDto {
  @ApiProperty({ example: 'id', description: '아이디' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  user_id: string;

  @ApiProperty({ example: 'password', description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  //정규 표현식
  //최소 70자 이상으로 영문자 대문자, 영문자 소문자, 숫자, 특수문자가 각각 최소 1개 이상
  @Matches(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$+= %^&*-]).{5,}$/,
    {
      message: 'password hash error',
    },
  )
  password: string;

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

  @ApiProperty({ example: 'Y', description: '휴대폰 인증 여부' })
  @IsNotEmpty()
  phone_verify: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    name: 'profile',
    required: false,
    description: '프로필 이미지',
  })
  profile_img: string;
}

//일반 회원가입 Output 데이터
export class UserSignupOutputDto {
  @ApiProperty({
    example: '201',
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '일반 회원가입 성공',
    description: '설명',
  })
  message: string;
}
