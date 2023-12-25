import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user.model';

jest.mock('./user.service');
jest.mock('@nestjs/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserService, JwtService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if valid email and password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
      } as User;
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);

      const result = await authService.validateUser(
        'test@example.com',
        'password',
      );

      expect(result).toEqual(mockUser);
    });

    it('should return null if invalid email or password', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);

      const result = await authService.validateUser(
        'test@example.com',
        'password',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate access token and remove password from user object', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      jest.spyOn(jwtService, 'sign').mockReturnValue('fakeAccessToken');

      const result = await authService.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: mockUser.email,
        sub: mockUser.id,
        ...mockUser,
      });
      expect(result).toEqual({
        access_token: 'fakeAccessToken',
      });
    });
  });
});
