import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'YOUR_SECRET_KEY', // Khuyên dùng process.env.JWT_SECRET
    });
  }

  async validate(payload: any) {
    // Giá trị trả về ở đây sẽ được gán tự động vào req.user
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}