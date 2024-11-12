import { getModels } from '../models/index.js';
import jwt from 'jsonwebtoken';
import authConfig from '../../configs/auth.js';
import dotenv from 'dotenv';
import {
  ConflictError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  AppError,
} from '../errors/appError.js';

dotenv.config();

const createUser = async (name, username, password) => {
  try {
    const { User } = getModels();
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new ConflictError('Username is already taken');
    }
    const user = new User({ name, username, password });
    await user.save();

    return {
      message: 'User created successfully',
      user: { id: user._id, name: user.name, username: user.username },
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    // if its a mongoose error
    if (error.name === 'ValidationError') {
      throw new ValidationError(error.message);
    }
    throw new AppError('Internal server error', 500);
  }
};

const loginUser = async (username, password) => {
  try {
    const { User } = getModels();
    const user = await User.findOne({ username });

    if (!user) {
      throw new NotFoundError('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
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

    // if its a mongoose error
    if (error.name === 'ValidationError') {
      throw new ValidationError(error.message);
    }
    throw new AppError('Internal server error', 500);
  }
};

const getUserById = async (userId) => {
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

    // if its a mongoose error
    if (error.name === 'CastError') {
      throw new ValidationError('Invalid user ID format');
    }
    throw new AppError('Internal server error', 500);
  }
};

const userService = {
  createUser,
  loginUser,
  getUserById,
};

export { userService };
