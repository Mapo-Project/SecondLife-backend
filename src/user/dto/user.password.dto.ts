import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

//비밀번호 암호화 테스트 Input 데이터
export class PasswordTestInputDto {
  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

//일반회원 비밀번호 변경 Input 데이터
export class PasswordChangeInputDto {
  @ApiProperty({
    example:
      'OQJ5fKSFQyd+geo1u8YkqYXMxUcdhOeCcgSEg2u46ykY8Wt7MaGp4nxOXFIGGsuAFsUihl3YDZtPs3ak5VC+rA==',
    description: '기존 비밀번호',
  })
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
  original_password: string;

  @ApiProperty({
    example:
      'OQJ5fKSFQyd+geo1u8YkqYXMxUcdhOeCcgSEg2u46ykY8Wt7MaGp4nxOXFIGGsuAFsUihl3YDZtPs3ak5VC+rA==',
    description: '변경할 비밀번호',
  })
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
  change_password: string;
}

//일반회원 비밀번호 변경 Output 데이터
export class PasswordChangeOutputDto {
  @ApiProperty({
    example: '201',
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '일반 회원 비밀번호 변경 성공',
    description: '설명',
  })
  message: string;
}
