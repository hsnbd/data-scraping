import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UserLoginDto } from './user-login.dto';

describe('UserLoginDto', () => {
  it('should not throw any error if data is valid', async () => {
    const data = { email: 'example@gmail.com', password: 'password' };
    const userLoginDto = plainToInstance(UserLoginDto, data);

    const errors = await validate(userLoginDto);
    expect(errors.length).toBe(0);
  });
  it('should throw error if data is not valid', async () => {
    const data = { email: 'example.com', password: 'password' };
    const userLoginDto = plainToInstance(UserLoginDto, data);

    const errors = await validate(userLoginDto);

    expect(errors.length).not.toBe(0);

    expect(JSON.stringify(errors)).toContain('email must be an email');
  });
});
