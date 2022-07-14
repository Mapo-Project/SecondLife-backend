import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

//일반 회원 로그인 Input 데이터
export class UserLoginInputDto {
  @ApiProperty({ example: 'id', description: '아이디' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ example: 'password', description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  //정규 표현식
  //최소 70자 이상으로 영문자 대문자, 영문자 소문자, 숫자, 특수문자가 각각 최소 1개 이상
  @Matches(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$+= %^&*-]).{70,}$/,
    {
      message: 'password hash error',
    },
  )
  password: string;
}

//일반 회원 로그인 Output 데이터
export class UserLoginOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '로그인 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZWZlZnNlMTEyNSIsImlhdCI6MTYzMTA4OTQyNn0.m4gl3atBiQZWnWCJlvxjvVeyPO-JN6_cR2pcgcovyKo',
    description: 'access토큰',
  })
  accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZWZlZnNlMTEyNSIsImlhdCI6MTYzMTA4OTQyNn0.m4gl3atBiQZWnWCJlvxjvVeyPO-JN6_cR2pcgcovyKo',
    description: 'refresh토큰',
  })
  refreshToken: string;
}

//소셜 회원 로그인 Output 데이터
export class UserSocialLoginOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '로그인 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({
    example: 'N',
    description: '추가정보 입력 여부',
  })
  verify: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZWZlZnNlMTEyNSIsImlhdCI6MTYzMTA4OTQyNn0.m4gl3atBiQZWnWCJlvxjvVeyPO-JN6_cR2pcgcovyKo',
    description: 'access토큰',
  })
  accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZWZlZnNlMTEyNSIsImlhdCI6MTYzMTA4OTQyNn0.m4gl3atBiQZWnWCJlvxjvVeyPO-JN6_cR2pcgcovyKo',
    description: 'refresh토큰',
  })
  refreshToken: string;
}
