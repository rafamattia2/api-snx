import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserController } from '../userController.js';
import { CreateUserDTO, LoginUserDTO } from '../../dtos/user/index.js';

vi.mock('../../dtos/user/index.js', () => ({
  CreateUserDTO: { validate: vi.fn() },
  LoginUserDTO: { validate: vi.fn() },
}));

vi.mock('../../services/userService.js', () => ({
  UserService: vi.fn().mockImplementation(() => ({
    createUser: vi.fn(),
    loginUser: vi.fn(),
    getUserById: vi.fn(),
  })),
}));

describe('UserController', () => {
  let controller;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    vi.clearAllMocks();

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
});
