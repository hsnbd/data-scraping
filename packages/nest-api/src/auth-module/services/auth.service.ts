import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      return user.get();
    }

    return null;
  }

  async login(user: any) {
    if (user.hasOwnProperty('password')) {
      delete user['password'];
    }

    const payload = { username: user.email, sub: user.id, ...user };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
