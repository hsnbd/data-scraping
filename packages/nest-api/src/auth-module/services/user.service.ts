import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import * as bcrypt from 'bcrypt';
import { UserRegistrationDto } from '../dto/user-registration.dto';

@Injectable()
export class UserService implements OnApplicationBootstrap {
  @InjectModel(User) private userModel: typeof User;

  async findOneByEmail(email: string, raw = true) {
    return this.userModel.findOne({ where: { email: email }, raw });
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

  async registration(userRegistrationDto: UserRegistrationDto) {
    userRegistrationDto.password = await bcrypt.hash(
      userRegistrationDto.password,
      10,
    );
    return await this.createUser(userRegistrationDto);
  }
}
