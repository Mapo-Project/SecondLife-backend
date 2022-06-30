import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { UserDto } from './dto/user.dto';

export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENTID,
      callbackURL: process.env.KAKAO_CALLBACKURL,
    });
  }

  async validate(accessToken, refreshToken, profile: any, done) {
    const payload: UserDto = {
      social_id: `${profile.id}`,
      method: 'google',
      email: profile.emails[0].value,
      profile_img: profile.photos[0].value,
    };

    return done(null, payload);
  }
}
