import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService implements OnApplicationBootstrap {
  @InjectModel(User) private userModel: typeof User;

  async findAll() {
    return this.userModel.findAll();
  }

  async findOneByEmail(email: string) {
    return this.userModel.findOne({ where: { email: email } });
  }

  async createUser(data: any) {
    return this.userModel.create(data);
  }

  async onApplicationBootstrap() {
    const adminEmail = 'admin@gmail.com';

    const adminExists = await this.findOneByEmail(adminEmail);

    if (!adminExists) {
      const adminPassword = await bcrypt.hash('password', 10);

      await this.createUser({
        full_name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        row_status: 1,
      });

      console.log('Admin user created successfully.');
    }
  }
}
