import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createImageURL } from 'src/user/multerOptions';
import { getConnection } from 'typeorm';
import { ProductFollowOutputDto } from './dto/product.follow.dto';
import { ProductLatestOutputDto } from './dto/product.latest.dto';
import { ProductPopularityOutputDto } from './dto/product.popularity.dto';
import {
  ProductRegistationInputDto,
  ProductRegistationOutputDto,
} from './dto/product.registration.dto';
import {
  ProductWishInputDto,
  ProductWishOutputDto,
  ProductWishSelectOutputDto,
} from './dto/pruduct.wish.dto';

@Injectable()
export class ProductService {
  private logger = new Logger('ProductService');

  async getProductFollow(user_id: string): Promise<ProductFollowOutputDto> {
    const conn = getConnection();

    const found = await conn.query(
      `SELECT PRODUCT.PRODUCT_ID AS product_id, SIZE AS size, PRICE AS price, PRODUCT_IMG AS product_img 
       FROM FOLLOW LEFT JOIN PRODUCT ON FOLLOW.FOLLOWING_USER_ID = PRODUCT.USER_ID 
       WHERE FOLLOW.USER_ID='${user_id}' AND FOLLOW.FOLLOW_YN='Y' ORDER BY PRODUCT.INSERT_DT DESC LIMIT 6`,
    );

    if (found.length !== 0) {
      this.logger.verbose(`User ${user_id} 팔로우 상품 최신순 조회 성공`);
      return {
        statusCode: 200,
        message: '팔로우 상품 최신순 조회 성공',
        data: found,
      };
    }

    throw new HttpException(
      '팔로우 상품 최신순 조회 실패',
      HttpStatus.NOT_FOUND,
    );
  }

  async getProductPopularity(): Promise<ProductPopularityOutputDto> {
    const conn = getConnection();

    const found = await conn.query(
      `SELECT PRODUCT.PRODUCT_ID AS product_id, COUNT(PRODUCT.PRODUCT_ID) AS wish_count, SIZE AS size, PRICE AS price, PRODUCT_IMG AS product_img 
       FROM PRODUCT LEFT JOIN WISH_LIST ON PRODUCT.PRODUCT_ID = WISH_LIST.PRODUCT_ID 
       WHERE WISH_LIST.WISH_YN='Y' AND DATE(PRODUCT.INSERT_DT) BETWEEN SUBDATE(CURDATE(),date_format(CURDATE(),'%w')-0) 
       AND SUBDATE(CURDATE(),date_format(CURDATE(),'%w')-6) GROUP BY PRODUCT.PRODUCT_ID ORDER BY wish_count DESC, PRODUCT.TITLE ASC LIMIT 6`,
    );

    if (found) {
      this.logger.verbose(`인기 상품 조회 성공`);
      return {
        statusCode: 200,
        message: '인기 상품 조회 성공',
        data: found,
      };
    }

    this.logger.verbose(`인기 상품 조회 실패`);
    throw new HttpException('인기 상품 조회 실패', HttpStatus.NOT_FOUND);
  }

  async getProductLatest(): Promise<ProductLatestOutputDto> {
    const conn = getConnection();

    const found = await conn.query(
      `SELECT PRODUCT_ID AS product_id, SIZE AS size, PRICE AS price, PRODUCT_IMG AS product_img FROM PRODUCT 
      WHERE USE_YN='Y' ORDER BY INSERT_DT DESC LIMIT 14 `,
    );

    if (found.length !== 0) {
      this.logger.verbose(`상품 최신순 조회 성공`);
      return {
        statusCode: 200,
        message: '상품 최신순 조회 성공',
        data: found,
      };
    }

    this.logger.verbose(`상품 최신순 조회 실패`);
    throw new HttpException('상품 최신순 조회 실패', HttpStatus.NOT_FOUND);
  }

  async productWish(
    user_id: string,
    productWishInputDto: ProductWishInputDto,
  ): Promise<ProductWishOutputDto> {
    const { product_id } = productWishInputDto;
    const conn = getConnection();

    const [found] = await conn.query(
      `SELECT USER_ID AS user_id FROM PRODUCT WHERE PRODUCT_ID='${product_id}' AND USE_YN='Y'`,
    );

    if (!found) {
      this.logger.verbose(`User ${user_id} 상품 ${product_id} 찜 실패`);
      throw new HttpException(
        '존재하지 않는 상품 입니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (user_id === found.user_id) {
      this.logger.verbose(`User ${user_id} 자기 상품을 찜 할 수 없습니다.`);
      throw new HttpException(
        '자기 상품을 찜 할 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const [existWish] = await conn.query(
      `SELECT WISH_YN AS wish_yn FROM WISH_LIST WHERE USER_ID='${user_id}' AND PRODUCT_ID='${product_id}'`,
    );

    if (existWish) {
      let wish_yn = '';

      if (existWish.wish_yn === 'Y') {
        wish_yn = 'N';
      } else {
        wish_yn = 'Y';
      }
      await conn.query(
        `UPDATE WISH_LIST SET WISH_YN='${wish_yn}', UPDATE_DT=NOW(), UPDATE_ID='${user_id}'
         WHERE USER_ID='${user_id}' AND PRODUCT_ID='${product_id}'`,
      );

      if (existWish.wish_yn === 'Y') {
        this.logger.verbose(`User ${user_id} 상품 ${product_id} 찜 해제 성공`);
        return {
          statusCode: 201,
          message: '상품 찜 해제 성공',
          wish: 'unWish',
        };
      } else {
        this.logger.verbose(`User ${user_id} 상품 ${product_id} 찜 등록 성공`);
        return {
          statusCode: 201,
          message: '상품 찜 등록 성공',
          wish: 'wish',
        };
      }
    }
    const sql = `INSERT INTO WISH_LIST(USER_ID, PRODUCT_ID, INSERT_DT, INSERT_ID)
                 VALUES(?,?,NOW(),?)`;
    const params = [user_id, product_id, user_id];

    await conn.query(sql, params);

    this.logger.verbose(`User ${user_id} 상품 ${product_id} 찜 등록 성공`);
    return {
      statusCode: 201,
      message: '상품 찜 등록 성공',
      wish: 'wish',
    };
  }

  async getProductWish(user_id: string): Promise<ProductWishSelectOutputDto> {
    const conn = getConnection();
    const [count] = await conn.query(
      `SELECT COUNT(WISH_ID) AS count FROM WISH_LIST WHERE USER_ID='${user_id}' AND WISH_YN='Y'`,
    );
    const wish = await conn.query(
      `SELECT WISH_LIST.PRODUCT_ID AS product_id, PRODUCT_IMG AS product_img FROM WISH_LIST INNER JOIN PRODUCT
       ON WISH_LIST.PRODUCT_ID = PRODUCT.PRODUCT_ID
       WHERE WISH_LIST.USER_ID='${user_id}' AND WISH_LIST.WISH_YN='Y'`,
    );

    if (count && wish.length !== 0) {
      this.logger.verbose(`User ${user_id} 상품 찜 조회 성공`);
      return {
        statusCode: 200,
        message: '상품 찜 조회 성공',
        count: parseInt(count.count),
        data: wish,
      };
    }

    throw new HttpException('상품 찜 조회 실패', HttpStatus.NOT_FOUND);
  }

  async registrationProduct(
    user_id: string,
    file: string,
    productRegistationInputDto: ProductRegistationInputDto,
  ): Promise<ProductRegistationOutputDto> {
    if (file) {
      const { tile, content, size, price } = productRegistationInputDto;
      const generatedFile = createImageURL(file);
      const conn = getConnection();

      const sql = `INSERT INTO PRODUCT(USER_ID, TITLE, CONTENT, SIZE, PRICE, INSERT_DT, INSERT_ID, PRODUCT_IMG) 
                  VALUES(?,?,?,?,?,NOW(),?,?)`;
      const params = [
        user_id,
        tile,
        content,
        size,
        price,
        user_id,
        generatedFile,
      ];
      try {
        await conn.query(sql, params);

        this.logger.verbose(`User ${user_id} 상품 등록 성공`);
        return {
          statusCode: 201,
          message: '상품 등록 성공',
        };
      } catch (error) {
        this.logger.error(`상품 등록 실패 Error: ${error}`);
        throw new InternalServerErrorException();
      }
    }

    this.logger.verbose(`User ${user_id} 상품 등록 실패`);
    throw new HttpException('상품 등록 실패', HttpStatus.BAD_REQUEST);
  }
}
