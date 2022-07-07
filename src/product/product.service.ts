import { Injectable, Logger } from '@nestjs/common';
import { createImageURL } from 'src/user/multerOptions';
import { getConnection } from 'typeorm';
import { ProductRegistationInputDto } from './dto/product.registration.dto';

@Injectable()
export class ProductService {
  private logger = new Logger('UserSerProductServicevice');
  async registrationProduct(
    user_id: string,
    file: string,
    productRegistationInputDto: ProductRegistationInputDto,
  ) {
    if (file) {
      const { tile, content, price } = productRegistationInputDto;
      const use_at = 'Y';
      const generatedFile = createImageURL(file);
      const conn = getConnection();

      const sql = `INSERT INTO product(user_id, title, content, price, use_at, create_at, product_img) 
                  VALUES(?,?,?,?,?,NOW(),?)`;
      const params = [user_id, tile, content, price, use_at, generatedFile];
      await conn.query(sql, params);

      this.logger.verbose(`User ${user_id} 상품 등록 성공`);
      return Object.assign({
        statusCode: 201,
        message: '상품 등록 성공',
      });
    }

    this.logger.verbose(`User ${user_id} 상품 등록 실패`);
    return Object.assign({
      statusCode: 400,
      message: '상품 등록 실패',
    });
  }

  async getProductLatest() {
    const conn = getConnection();

    const found = await conn.query(
      `SELECT product_id, product_img FROM product 
      WHERE use_at='Y' ORDER BY create_at DESC LIMIT 14 `,
    );

    if (found.length !== 0) {
      this.logger.verbose(`상품 최신순 조회 성공`);
      return Object.assign({
        statusCode: 200,
        message: '상품 최신순 조회 성공',
        data: found,
      });
    }

    this.logger.verbose(`상품 최신순 조회 실패`);
    return Object.assign({
      statusCode: 400,
      message: '상품 최신순 조회 실패',
    });
  }
}
