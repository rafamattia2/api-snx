import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserController } from '../userController.js';
import userService from '../../services/userService.js';
import { CreateUserDTO, LoginUserDTO } from '../../dtos/user/index.js';

vi.mock('../../services/userService.js');
vi.mock('../../dtos/user/index.js');

describe('UserController', () => {
  let userController;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    userController = new UserController();
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
        user: { id: 1, name: 'Test User', username: 'testuser' },
      };

      CreateUserDTO.validate.mockResolvedValue(validatedData);
      userService.createUser.mockResolvedValue(serviceResponse);

      await userController.registerUser(mockReq, mockRes, mockNext);

      expect(CreateUserDTO.validate).toHaveBeenCalledWith(mockReq.body);
      expect(userService.createUser).toHaveBeenCalledWith(validatedData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Validation error');
      CreateUserDTO.validate.mockRejectedValue(error);

      await userController.registerUser(mockReq, mockRes, mockNext);

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
      userService.loginUser.mockResolvedValue(serviceResponse);

      await userController.loginUser(mockReq, mockRes, mockNext);

      expect(LoginUserDTO.validate).toHaveBeenCalledWith(mockReq.body);
      expect(userService.loginUser).toHaveBeenCalledWith(validatedData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('Invalid credentials');
      LoginUserDTO.validate.mockRejectedValue(error);

      await userController.loginUser(mockReq, mockRes, mockNext);

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

      userService.getUserById.mockResolvedValue(serviceResponse);

      await userController.getUser(mockReq, mockRes, mockNext);

      expect(userService.getUserById).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
    });

    it('should handle errors through next middleware', async () => {
      const error = new Error('User not found');
      userService.getUserById.mockRejectedValue(error);

      await userController.getUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
