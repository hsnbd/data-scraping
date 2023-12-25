import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UserRegistrationDto } from './user-registration.dto';
jest.mock('../custom-validation/unique-email.validation', () => {
  return {
    UniqueEmailValidation: jest.fn().mockImplementation(() => ({
      validate: jest.fn(),
      defaultMessage: jest.fn(),
    })),
  };
});
describe('UserRegistrationDto', () => {
  it('should not throw any error if data is valid', async () => {
    const data = {
      full_name: 'Example',
      email: 'example@gmail.com',
      password: 'password',
    };
    const userRegistrationDto = plainToInstance(UserRegistrationDto, data);

    const errors = await validate(userRegistrationDto);

    expect(errors.length).toBe(0);
  });

  it('should throw error if data is not valid', async () => {
    const data = { email: 'example.com', password: 'password' };
    const userRegistrationDto = plainToInstance(UserRegistrationDto, data);

    const errors = await validate(userRegistrationDto);

    expect(errors.length).not.toBe(0);

    expect(JSON.stringify(errors)).toContain('email must be an email');
  });
});
