import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createImageURL } from 'src/user/multerOptions';
import { getConnection } from 'typeorm';
import { ProductLatestOutputDto } from './dto/product.latest.dto';
import {
  ProductRegistationInputDto,
  ProductRegistationOutputDto,
} from './dto/product.registration.dto';

@Injectable()
export class ProductService {
  private logger = new Logger('UserSerProductServicevice');
  async registrationProduct(
    user_id: string,
    file: string,
    productRegistationInputDto: ProductRegistationInputDto,
  ): Promise<ProductRegistationOutputDto> {
    if (file) {
      const { tile, content, price } = productRegistationInputDto;
      const use_yn = 'Y';
      const generatedFile = createImageURL(file);
      const conn = getConnection();

      const sql = `INSERT INTO product(USER_ID, TITLE, CONTENT, PRICE, USE_YN, INSERT_DT, PRODUCT_IMG) 
                  VALUES(?,?,?,?,?,NOW(),?)`;
      const params = [user_id, tile, content, price, use_yn, generatedFile];
      try {
        await conn.query(sql, params);

        this.logger.verbose(`User ${user_id} 상품 등록 성공`);
        return {
          statusCode: 201,
          message: '상품 등록 성공',
        };
      } catch (error) {
        this.logger.error(`일반 회원가입 실패 Error: ${error}`);
        throw new InternalServerErrorException();
      }
    }

    this.logger.verbose(`User ${user_id} 상품 등록 실패`);
    throw new HttpException('상품 등록 실패', HttpStatus.BAD_REQUEST);
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
}
