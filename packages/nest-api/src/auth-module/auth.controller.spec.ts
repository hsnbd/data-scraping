import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { UserRegistrationDto } from './dto/user-registration.dto';
import { User } from './models/user.model';

jest.mock('./services/user.service');
jest.mock('./services/auth.service');

describe('AuthController', () => {
  let controller: AuthController;
  let userService: UserService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [UserService, AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registration', () => {
    it('should register a new user and return login result', async () => {
      const userRegistrationDto: UserRegistrationDto = {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
      };

      const mockUser = { get: jest.fn() } as unknown as User;
      jest.spyOn(userService, 'registration').mockResolvedValueOnce(mockUser);
      jest
        .spyOn(authService, 'login')
        .mockReturnValueOnce(Promise.resolve({ access_token: 'fakeToken' }));

      const result = await controller.registration(userRegistrationDto);

      expect(userService.registration).toHaveBeenCalledWith(
        userRegistrationDto,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser.get());
      expect(result).toEqual({ access_token: 'fakeToken' });
    });
  });

  describe('login', () => {
    it('should log in user and return login result', async () => {
      const userLoginDto = { email: 'john@example.com', password: 'password' };
      const mockUser = { get: jest.fn() };

      jest
        .spyOn(authService, 'login')
        .mockReturnValueOnce(Promise.resolve({ access_token: 'fakeToken' }));

      const result = await controller.login(userLoginDto, { user: mockUser });

      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ access_token: 'fakeToken' });
    });
  });

  describe('getProfile', () => {
    it('should return user from request object', () => {
      const mockUser = { id: 1, username: 'john.doe' };

      const result = controller.getProfile({ user: mockUser });

      expect(result).toEqual(mockUser);
    });
  });
});
