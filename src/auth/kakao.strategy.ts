import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { UserDto } from './dto/user.dto';

export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // clientID: process.env.KAKAO_CLIENTID_LOCAL,
      // callbackURL: process.env.KAKAO_CALLBACKURL_LOCAL,
      clientID: process.env.KAKAO_CLIENTID,
      callbackURL: process.env.KAKAO_CALLBACKURL,
    });
  }

  async validate(accessToken, refreshToken, profile, done) {
    const profileJson = profile._json;
    const kakao_account = profileJson.kakao_account;
    const payload: UserDto = {
      user_id: `${profileJson.id}`,
      name: kakao_account.profile.nickname,
      method: 'kakao',
      email:
        kakao_account && !kakao_account.email_needs_agreement
          ? kakao_account.email
          : null,
      profile_img: kakao_account.profile.thumbnail_image_url,
    };

    return done(null, payload);
  }
}
