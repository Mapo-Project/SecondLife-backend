import { ApiProperty } from '@nestjs/swagger';

//탑 셀러 데이터
export class UserTopSellerDto {
  @ApiProperty({ example: 'secondLife', description: '아이디' })
  user_id: string;

  @ApiProperty({ example: '셀러', description: '이름' })
  name: string;

  @ApiProperty({ example: '1', description: '순위' })
  rank: string;

  @ApiProperty({ example: '4.5', description: '별점' })
  star_count: string;

  @ApiProperty({ example: '1', description: '팔로워 수' })
  follower_count: string;

  @ApiProperty({ example: '10', description: '판매 수' })
  sold_count: string;

  @ApiProperty({ example: 'img', description: '프로필 이미지' })
  profile_img: string;
}

//이달의 탑 셀러 Output 데이터
export class UserTopSellerOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '이달의 탑 셀러 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({ type: [UserTopSellerDto] })
  data: UserTopSellerDto;
}
