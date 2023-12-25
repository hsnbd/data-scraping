import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { getModelToken } from '@nestjs/sequelize';

const mockSequelizeModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

jest.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: mockSequelizeModel,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return user by email', async () => {
      const mockUser = {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        row_status: 1,
      } as User;
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);

      const result = await userService.findOneByEmail('john@example.com');

      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUserData = {
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'hashedPassword',
        row_status: 1,
      };
      jest.spyOn(User, 'create').mockResolvedValueOnce({ ...mockUserData });

      const result = await userService.createUser(mockUserData);

      expect(result).toEqual({ ...mockUserData });
    });
  });

  describe('onApplicationBootstrap', () => {
    it('should create admin user if not exists', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce(null);
      jest.spyOn(userService, 'createUser').mockResolvedValueOnce({} as User);

      await userService.onApplicationBootstrap();

      expect(userService.findOneByEmail).toHaveBeenCalledWith(
        'admin@gmail.com',
      );
      expect(userService.createUser).toHaveBeenCalledWith({
        full_name: 'Admin',
        email: 'admin@gmail.com',
        password: expect.any(String),
        row_status: 1,
      });
    });

    it('should not create admin user if already exists', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce({} as User);

      await userService.onApplicationBootstrap();

      expect(userService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('registration', () => {
    it('should register a new user', async () => {
      const mockUserRegistrationDto = {
        full_name: 'New User',
        email: 'newuser@example.com',
        password: 'hashedPassword',
      } as User;
      jest
        .spyOn(userService, 'createUser')
        .mockResolvedValueOnce(mockUserRegistrationDto);

      const result = await userService.registration(mockUserRegistrationDto);

      expect(result).toEqual({ ...mockUserRegistrationDto });
    });
  });
});
