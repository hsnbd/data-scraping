import { Test, TestingModule } from '@nestjs/testing';
import { UniqueEmailValidation } from './unique-email.validation';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

describe('UniqueEmailValidation', () => {
  let uniqueEmailValidation: UniqueEmailValidation;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniqueEmailValidation,
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    uniqueEmailValidation = module.get<UniqueEmailValidation>(
      UniqueEmailValidation,
    );
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(uniqueEmailValidation).toBeDefined();
  });

  it('should return true for a unique email', async () => {
    const email = 'unique@example.com';

    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);

    const result = await uniqueEmailValidation.validate(email);

    expect(result).toBe(true);
  });

  it('should return false for a non-unique email', async () => {
    const email = 'existing@example.com';

    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue({} as User);

    const result = await uniqueEmailValidation.validate(email);

    expect(result).toBe(false);
  });

  it('should have a default error message', () => {
    const defaultMessage = uniqueEmailValidation.defaultMessage();

    expect(defaultMessage).toBe('Email already exist');
  });
});
