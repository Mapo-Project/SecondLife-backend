import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  MaxLength,
  MinLength,
} from 'class-validator';

//유저 인증 Input 데이터
export class UserAuthPhoneInputDto {
  @ApiProperty({
    name: 'phone_number',
    description: '인증 받을 휴대폰 번호',
    example: '01033337777',
  })
  @IsNotEmpty()
  @IsNumberString()
  @MinLength(11)
  @MaxLength(11)
  phone_number: number;
}

export class UserAuthPhoneOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '휴대폰 인증 번호 생성 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({
    example: 126456,
    description: '인증 번호',
  })
  code: number;
}
