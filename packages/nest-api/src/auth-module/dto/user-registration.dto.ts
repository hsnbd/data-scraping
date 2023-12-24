import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Validate } from 'class-validator';
import { UniqueEmailValidation } from '../custom-validation/unique-email.validation';

export class UserRegistrationDto {
  @ApiProperty()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty()
  @IsEmail()
  @Validate(UniqueEmailValidation)
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
