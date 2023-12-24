import {
  Controller,
  Inject,
  Post,
  UseGuards,
  Body,
  Request,
  Get,
} from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserLoginDto } from './dto/user-login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './services/auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class AuthController {
  @Inject()
  private readonly userService: UserService;
  @Inject()
  private readonly authService: AuthService;

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Body() userLoginDto: UserLoginDto, @Request() req: any) {
    return this.authService.login(req.user);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
