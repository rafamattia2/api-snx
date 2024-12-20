import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserController } from '../userController.js';
import {
  CreateUserDTO,
  LoginUserDTO,
  UpdateUserDTO,
} from '../../dtos/user/index.js';
import { UserService } from '../../services/userService.js';
import pagination from '../../utils/pagination.js';

vi.mock('../../dtos/user/index.js', () => ({
  CreateUserDTO: { validate: vi.fn() },
  LoginUserDTO: { validate: vi.fn() },
  UpdateUserDTO: { validate: vi.fn() },
}));

vi.mock('../../utils/pagination.js', () => ({
  getPagination: vi.fn(),
  createPaginatedResponse: vi.fn(),
  default: {
    getPagination: vi.fn(),
    createPaginatedResponse: vi.fn(),
  },
}));

vi.mock('../../services/userService.js');

describe('UserController', () => {
  let controller;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    vi.clearAllMocks();

    UserService.mockImplementation(() => ({
      createUser: vi.fn(),
      loginUser: vi.fn(),
      getUserById: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      listUsers: vi.fn(),
    }));

    controller = new UserController();
    mockNext = vi.fn();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('registerUser', () => {
    beforeEach(() => {
      mockReq = {
        body: {
          name: 'Test User',
          username: 'testuser',
          password: 'password123',
        },
      };
    });

    it('should register a user successfully', async () => {
      const validatedData = { ...mockReq.body };
      const serviceResponse = {
        message: 'User created successfully',
        user: {
          id: 1,
          name: 'Test User',
          username: 'testuser',
        },
      };

      CreateUserDTO.validate.mockResolvedValue(validatedData);
      controller.userService.createUser.mockResolvedValue(serviceResponse);

      await controller.registerUser(mockReq, mockRes, mockNext);

      expect(CreateUserDTO.validate).toHaveBeenCalledWith(mockReq.body);
      expect(controller.userService.createUser).toHaveBeenCalledWith(
        validatedData
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Validation error');
      CreateUserDTO.validate.mockRejectedValue(error);

      await controller.registerUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('loginUser', () => {
    beforeEach(() => {
      mockReq = {
        body: {
          username: 'testuser',
          password: 'password123',
        },
      };
    });

    it('should login user successfully', async () => {
      const validatedData = { ...mockReq.body };
      const serviceResponse = {
        message: 'Login successful',
        token: 'jwt-token',
      };

      LoginUserDTO.validate.mockResolvedValue(validatedData);
      controller.userService.loginUser.mockResolvedValue(serviceResponse);

      await controller.loginUser(mockReq, mockRes, mockNext);

      expect(LoginUserDTO.validate).toHaveBeenCalledWith(mockReq.body);
      expect(controller.userService.loginUser).toHaveBeenCalledWith(
        validatedData
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Invalid credentials');
      LoginUserDTO.validate.mockRejectedValue(error);

      await controller.loginUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getUser', () => {
    beforeEach(() => {
      mockReq = {
        params: {
          userId: '123',
        },
      };
    });

    it('should get user successfully', async () => {
      const serviceResponse = {
        user: {
          id: '123',
          name: 'Test User',
          username: 'testuser',
        },
      };

      controller.userService.getUserById.mockResolvedValue(serviceResponse);

      await controller.getUser(mockReq, mockRes, mockNext);

      expect(controller.userService.getUserById).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('User not found');
      controller.userService.getUserById.mockRejectedValue(error);

      await controller.getUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUser', () => {
    beforeEach(() => {
      mockReq = {
        params: { userId: '123' },
        body: {
          name: 'Updated Name',
          username: 'updateduser',
        },
        user: { id: '123' },
      };
    });

    it('should update user successfully', async () => {
      const validatedData = { ...mockReq.body };
      const serviceResponse = {
        id: '123',
        name: 'Updated Name',
        username: 'updateduser',
      };

      // Mock do UserService para retornar uma instância com updateUser
      const mockUpdateUser = vi.fn().mockResolvedValue(serviceResponse);
      UserService.mockImplementation(() => ({
        updateUser: mockUpdateUser,
      }));

      UpdateUserDTO.validate.mockResolvedValue(validatedData);

      await controller.updateUser(mockReq, mockRes, mockNext);

      expect(UpdateUserDTO.validate).toHaveBeenCalledWith(mockReq.body);
      expect(mockUpdateUser).toHaveBeenCalledWith(
        mockReq.params.userId,
        validatedData
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Validation error');
      UpdateUserDTO.validate.mockRejectedValue(error);

      await controller.updateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      mockReq = {
        params: { userId: '123' },
      };
    });

    it('should delete user successfully', async () => {
      const serviceResponse = { message: 'User deleted successfully' };
      controller.userService.deleteUser.mockResolvedValue(serviceResponse);

      await controller.deleteUser(mockReq, mockRes, mockNext);

      expect(controller.userService.deleteUser).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('User not found');
      controller.userService.deleteUser.mockRejectedValue(error);

      await controller.deleteUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listUsers', () => {
    beforeEach(() => {
      mockReq = {
        query: { page: '1', limit: '10' },
      };
    });

    it('should list users successfully', async () => {
      const paginationData = { page: 1, limit: 10 };
      const serviceResponse = {
        users: [
          { id: '1', name: 'User 1', username: 'user1' },
          { id: '2', name: 'User 2', username: 'user2' },
        ],
        total: 2,
      };
      const paginatedResponse = {
        data: serviceResponse.users,
        pagination: {
          total: 2,
          currentPage: 1,
          totalPages: 1,
        },
      };

      pagination.getPagination.mockReturnValue(paginationData);
      controller.userService.listUsers.mockResolvedValue(serviceResponse);
      pagination.createPaginatedResponse.mockReturnValue(paginatedResponse);

      await controller.listUsers(mockReq, mockRes, mockNext);

      expect(pagination.getPagination).toHaveBeenCalledWith(mockReq);
      expect(controller.userService.listUsers).toHaveBeenCalledWith(1, 10);
      expect(pagination.createPaginatedResponse).toHaveBeenCalledWith(
        serviceResponse.users,
        serviceResponse.total,
        paginationData.page,
        paginationData.limit
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(paginatedResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Database error');
      pagination.getPagination.mockImplementation(() => {
        throw error;
      });

      await controller.listUsers(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
