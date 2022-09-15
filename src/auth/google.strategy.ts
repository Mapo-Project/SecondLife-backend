import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { UserDto } from './dto/user.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENTIDSECRET,
      callbackURL: process.env.GOOGLE_CALLBACKURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken, refreshToken, profile: any, done: any) {
    const payload: UserDto = {
      social_id: `${profile.id}`,
      method: 'google',
      email: profile.emails[0].value,
      profile_img: profile.photos[0].value,
    };

    return done(null, payload);
  }
}
