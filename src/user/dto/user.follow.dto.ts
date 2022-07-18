import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

//회원 팔로우 / 언팔로우 Input 데이터
export class UserFollowInputDto {
  @ApiProperty({
    name: 'follow_user_id',
    description: '팔로우 / 언팔로우 할 유제 아이디',
    example: 'secondLife',
  })
  @IsNotEmpty()
  follow_user_id: string;
}

//회원 팔로우 Output 데이터
export class UserFollowOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 팔로우 성공 | 회원 언팔로우 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({
    example: 'follow | unFollow',
    description: '팔로우 여부',
  })
  follow: 'follow' | 'unFollow';
}

//회원 팔로잉 데이터
export class UserFollowwingDto {
  @ApiProperty({ example: 'secondLife', description: '아이디' })
  following_user_id: string;

  @ApiProperty({ example: '셀러', description: '이름' })
  name: string;

  @ApiProperty({ example: 'img', description: '프로필 이미지' })
  profile_img: string;
}

//회원 팔로잉 Output 데이터
export class UserFollowwingOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 팔로잉 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({
    example: 1,
    description: '팔로잉 수',
  })
  count: number;

  @ApiProperty({ type: [UserFollowwingDto] })
  data: UserFollowwingDto;
}
