import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

//일반 회원 아이디 찾기 Input 데이터
export class UserFindIdInputDto {
  @ApiProperty({ example: 'name', description: '이름' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'email@secondLife.com', description: '이메일' })
  @IsEmail()
  email: string;
}

//일반 회원 아이디 찾기 Output 데이터
export class UserFindIdOutputDto {
  @ApiProperty({
    example: '201',
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '일반 회원 아이디 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({
    example: 'hee1234',
    description: '유저 아이디',
  })
  user_id: string;
}
