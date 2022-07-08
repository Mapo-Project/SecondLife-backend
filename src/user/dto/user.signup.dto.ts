import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
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
  // @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#.?!@$%^&*-]).{20,}$/, {
  //   message: 'password hash error',
  // })
  password: string;

  @ApiProperty({ example: 'name', description: '이름' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'nickname', description: '닉네임' })
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({ example: '01033337777', description: '휴대폰 번호' })
  @IsNotEmpty()
  phone_num: string;

  @ApiProperty({ example: 'email@secondLife.com', description: '이메일' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

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
