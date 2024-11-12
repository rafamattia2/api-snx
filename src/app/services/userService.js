import { getModels } from '../models/index.js';
import jwt from 'jsonwebtoken';
import authConfig from '../../configs/auth.js';
import {
  ConflictError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  AppError,
} from '../errors/appError.js';

const userService = {
  async createUser(data) {
    try {
      const { User } = getModels();
      const existingUser = await User.findOne({ username: data.username });

      if (existingUser) {
        throw new ConflictError('Username is already taken');
      }
      const user = await User.create(data);

      return {
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.name === 'ValidationError') {
        throw new ValidationError(error.message);
      }
      throw new AppError('Internal server error', 500);
    }
  },

  async loginUser(credentials) {
    try {
      const { User } = getModels();
      const user = await User.findOne({ username: credentials.username });

      if (!user) {
        throw new NotFoundError('Invalid credentials');
      }

      const isPasswordValid = await user.comparePassword(credentials.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
      }

      const token = jwt.sign(
        { id: user._id, username: user.username },
        authConfig.jwt.secret,
        { expiresIn: authConfig.jwt.expiresIn }
      );

      return {
        message: 'Login successful',
        token,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.name === 'ValidationError') {
        throw new ValidationError(error.message);
      }

      throw new AppError('Internal server error', 500);
    }
  },

  async getUserById(userId) {
    try {
      const { User } = getModels();
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.name === 'CastError') {
        throw new ValidationError('Invalid user ID format');
      }
      throw new AppError('Internal server error', 500);
    }
  },
};

export default userService;
