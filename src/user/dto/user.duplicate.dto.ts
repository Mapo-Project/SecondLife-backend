import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

//닉네임 중복체크 Input 데이터
export class NickNameDuplicateInputDto {
  @ApiProperty({
    name: 'nickname',
    description: '중복 체크 할 닉네임',
    example: 'secondLife',
  })
  @IsNotEmpty()
  nickname: string;
}

//닉네임 중복체크 Output 데이터
export class NickNameDuplicateOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '닉네임 중복체크 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({
    example: 'true',
    description: '중복체크 여부',
  })
  duplicate: string;
}

//아이디 중복체크 Input 데이터
export class UserIdDuplicateInputDto {
  @ApiProperty({
    name: 'user_id',
    description: '중복 체크 할 아이디',
    example: 'secondLife',
  })
  @IsNotEmpty()
  user_id: string;
}

//아이디 중복체크 Output 데이터
export class UserIdDuplicateOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '아이디 중복체크 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({
    example: 'true',
    description: '중복체크 여부',
  })
  duplicate: string;
}
