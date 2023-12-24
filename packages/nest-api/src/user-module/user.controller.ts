import { Controller, Get, Inject } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('/users')
export class UserController {
  @Inject()
  private readonly userService: UserService;

  @Get('/')
  async findAll() {
    return await this.userService.findAll();
  }
}
