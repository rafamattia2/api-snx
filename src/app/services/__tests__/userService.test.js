import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AppError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../errors/appError.js';
import { getModels } from '../../models/index.js';
import { UserService } from '../userService.js';
import jwt from 'jsonwebtoken';

vi.mock('../../models/index.js');
vi.mock('jsonwebtoken');

describe('UserService', () => {
  let userService;
  let mockUser;

  beforeEach(() => {
    vi.clearAllMocks();

    userService = new UserService();

    mockUser = {
      _id: 'userId123',
      name: 'Test User',
      username: 'testuser',
      comparePassword: vi.fn(),
    };
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        password: 'password123',
      };

      getModels.mockReturnValue({
        User: {
          findOne: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue(mockUser),
        },
      });

      const result = await userService.createUser(userData);

      expect(result).toEqual({
        message: 'User created successfully',
        user: {
          id: mockUser._id,
          name: mockUser.name,
          username: mockUser.username,
        },
      });
    });

    it('should throw ConflictError when username already exists', async () => {
      const userData = {
        name: 'Test User',
        username: 'existinguser',
        password: 'password123',
      };

      getModels.mockReturnValue({
        User: {
          findOne: vi.fn().mockResolvedValue(mockUser),
        },
      });

      await expect(userService.createUser(userData)).rejects.toThrow(
        ConflictError
      );
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const credentials = {
        username: 'testuser',
        password: 'password123',
      };

      mockUser.comparePassword.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');

      getModels.mockReturnValue({
        User: {
          findOne: vi.fn().mockResolvedValue(mockUser),
        },
      });

      const result = await userService.loginUser(credentials);

      expect(result).toEqual({
        message: 'Login successful',
        token: 'mock-token',
      });
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const credentials = {
        username: 'nonexistent',
        password: 'password123',
      };

      getModels.mockReturnValue({
        User: {
          findOne: vi.fn().mockResolvedValue(null),
        },
      });

      await expect(userService.loginUser(credentials)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw UnauthorizedError when password is invalid', async () => {
      const credentials = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockUser.comparePassword.mockResolvedValue(false);

      getModels.mockReturnValue({
        User: {
          findOne: vi.fn().mockResolvedValue(mockUser),
        },
      });

      await expect(userService.loginUser(credentials)).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id successfully', async () => {
      const userId = 'userId123';

      getModels.mockReturnValue({
        User: {
          findById: vi.fn().mockResolvedValue(mockUser),
        },
      });

      const result = await userService.getUserById(userId);

      expect(result).toEqual({
        user: {
          id: mockUser._id,
          name: mockUser.name,
          username: mockUser.username,
        },
      });
    });

    it('should throw NotFoundError when user is not found', async () => {
      const userId = 'nonexistentId';

      getModels.mockReturnValue({
        User: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      await expect(userService.getUserById(userId)).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
