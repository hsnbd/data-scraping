import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { AuthController } from './auth.controller';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigKey } from '../core/config/app-config';
import { UniqueEmailValidation } from './custom-validation/unique-email.validation';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(ConfigKey.JWT_SECRET),
        signOptions: { expiresIn: '5h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    UserService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    UniqueEmailValidation,
  ],
  exports: [UserService, SequelizeModule],
})
export class AuthModule {}
