import { describe, it, expect, beforeEach, vi } from 'vitest';
import userService from '../userService.js';
import { getModels } from '../../models/index.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  AppError,
} from '../../errors/appError.js';
import jwt from 'jsonwebtoken';

vi.mock('../../models/index.js', async () => {
  return {
    getModels: vi.fn(),
  };
});

vi.mock('jsonwebtoken', async () => {
  return {
    default: {
      sign: vi.fn(),
    },
  };
});

describe('UserService', () => {
  let mockUser;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUser = {
      _id: 'mockId',
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
        username: 'testuser',
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

    it('should throw ValidationError when validation fails', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        password: 'password123',
      };

      getModels.mockReturnValue({
        User: {
          findOne: vi.fn().mockRejectedValue({
            name: 'ValidationError',
            message: 'Invalid data',
          }),
        },
      });

      await expect(userService.createUser(userData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw AppError for unknown errors', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        password: 'password123',
      };

      getModels.mockReturnValue({
        User: {
          findOne: vi.fn().mockRejectedValue(new Error('Unknown error')),
        },
      });

      await expect(userService.createUser(userData)).rejects.toThrow(AppError);
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
        username: 'testuser',
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
      const userId = 'mockId';

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

    it('should throw ValidationError when user ID format is invalid', async () => {
      const userId = 'invalidId';

      getModels.mockReturnValue({
        User: {
          findById: vi.fn().mockRejectedValue({ name: 'CastError' }),
        },
      });

      await expect(userService.getUserById(userId)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw AppError for unknown errors', async () => {
      const userId = 'mockId';

      getModels.mockReturnValue({
        User: {
          findById: vi.fn().mockRejectedValue(new Error('Unknown error')),
        },
      });

      await expect(userService.getUserById(userId)).rejects.toThrow(AppError);
    });
  });
});
