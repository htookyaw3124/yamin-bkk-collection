import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly adminEmail: string;
  private readonly adminPassword: string;
  private readonly jwtTtlSeconds = 60 * 30; // 30 minutes

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@yaminbkk.com');
    this.adminPassword = this.configService.get<string>('ADMIN_PASSWORD', 'changeme');
  }

  async validateAdmin(email: string, password: string) {
    if (email !== this.adminEmail || password !== this.adminPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { email };
  }

  async login(email: string) {
    const payload = { sub: 'admin', email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.jwtTtlSeconds,
    });

    return {
      accessToken,
      expiresIn: this.jwtTtlSeconds,
    };
  }
}
