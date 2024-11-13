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

  describe('updateUser', () => {
    it('deve atualizar o usuário com sucesso', async () => {
      const userData = {
        name: 'Nome Atualizado',
        username: 'novousername',
      };

      const mockUpdatedUser = {
        _id: 'userId123',
        name: 'Nome Atualizado',
        username: 'novousername',
      };

      userService.requestUser = { id: 'userId123' };

      getModels.mockReturnValue({
        User: {
          findById: vi.fn().mockResolvedValue(mockUser),
          findOne: vi.fn().mockResolvedValue(null),
          findByIdAndUpdate: vi.fn().mockResolvedValue(mockUpdatedUser),
        },
      });

      const result = await userService.updateUser('userId123', userData);

      expect(result.user).toEqual({
        id: mockUpdatedUser._id,
        name: mockUpdatedUser.name,
        username: mockUpdatedUser.username,
      });
    });

    it('deve lançar UnauthorizedError quando tentar atualizar outro usuário', async () => {
      userService.requestUser = { id: 'differentUserId' };

      getModels.mockReturnValue({
        User: {
          findById: vi.fn().mockResolvedValue(mockUser),
        },
      });

      await expect(
        userService.updateUser('userId123', { name: 'Novo Nome' })
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('deleteUser', () => {
    it('deve deletar o usuário com sucesso', async () => {
      getModels.mockReturnValue({
        User: {
          findById: vi.fn().mockResolvedValue(mockUser),
          findByIdAndDelete: vi.fn().mockResolvedValue(true),
        },
      });

      const result = await userService.deleteUser('userId123');

      expect(result.message).toBe('User deleted successfully');
    });

    it('deve lançar NotFoundError quando o usuário não existe', async () => {
      getModels.mockReturnValue({
        User: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      await expect(userService.deleteUser('nonexistentId')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('listUsers', () => {
    it('deve listar usuários com paginação', async () => {
      const mockUsers = [
        {
          _id: 'userId123',
          name: 'Test User',
          username: 'testuser',
        },
      ];

      getModels.mockReturnValue({
        User: {
          countDocuments: vi.fn().mockResolvedValue(1),
          find: vi.fn().mockReturnValue({
            skip: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue(mockUsers),
              }),
            }),
          }),
        },
      });

      const result = await userService.listUsers(1, 10);

      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.users[0]).toEqual({
        id: mockUsers[0]._id,
        name: mockUsers[0].name,
        username: mockUsers[0].username,
      });
    });
  });
});
