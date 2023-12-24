import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';

@Injectable()
export class UserService {
  @InjectModel(User) private userModel: typeof User;

  async findAll() {
    return this.userModel.findAll();
  }
}
