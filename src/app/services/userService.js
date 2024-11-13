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
import bcrypt from 'bcryptjs';

export class UserService {
  constructor(requestUser) {
    this.requestUser = requestUser;
  }

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
  }

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
  }

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
  }

  async updateUser(userId, data) {
    try {
      const { User } = getModels();
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (this.requestUser.id !== userId) {
        throw new UnauthorizedError('You can only update your own profile');
      }

      if (data.username && data.username !== user.username) {
        const existingUser = await User.findOne({ username: data.username });
        if (existingUser) {
          throw new ConflictError('Username is already taken');
        }
      }

      if (data.password) {
        const salt = await bcrypt.genSalt(8);
        data.password = await bcrypt.hash(data.password, salt);
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: data },
        { new: true }
      );

      return {
        message: 'User updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          username: updatedUser.username,
        },
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'CastError')
        throw new ValidationError('Invalid user ID format');
      throw new AppError('Internal server error', 500);
    }
  }

  async deleteUser(userId) {
    try {
      const { User } = getModels();
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      await User.findByIdAndDelete(userId);

      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'CastError')
        throw new ValidationError('Invalid user ID format');
      throw new AppError('Internal server error', 500);
    }
  }

  async listUsers(page, limit) {
    try {
      const { User } = getModels();
      const total = await User.countDocuments();
      const users = await User.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-password');

      const formattedUsers = users.map((user) => ({
        id: user._id,
        name: user.name,
        username: user.username,
      }));

      return { users: formattedUsers, total };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Internal server error', 500);
    }
  }
}
