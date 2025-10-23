import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import HttpError from '@domain/utils/errors/http-errors';
import GetUserByUserName from '@use-cases/users/get-user-by-username';
import GetUserByEmail from '@use-cases/users/get-user-by-username';
import path from 'path';

@Injectable()
export class LoginService {
  constructor(
    private jwtService: JwtService,
    private getUserByEmail: GetUserByEmail,
  ) {}

  async login(email: string, password: string) {
    const user = await this.getUserByEmail.Execute(email);
    if (!user) new HttpError('Invalid Email or password').BadRequest();
    if (bcrypt.compareSync(password, user.password)) {
      const payload = {
        sub: user.id,
        email: user.email,
        screens: [
          { path: '/dashboard', name: 'Dashboard' },
          { path: '/schedule', name: 'Agenda' },
        ],
      };

      const rt = this.jwtService.sign(
        { rsd: user.id },
        { secret: process.env.JWT_SECRET_REFRESH, expiresIn: '30d' },
      );

      const jwt = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET_ACCESS,
        expiresIn: '30d',
      });

      return { Token: 'Bearer ' + jwt, RefreshToken: rt };
    } else new HttpError('Invalid email or password').BadRequest();
  }
}
