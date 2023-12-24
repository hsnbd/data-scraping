import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
