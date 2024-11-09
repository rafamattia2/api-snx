import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import authConfig from '../../configs/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const createUser = async (name, username, password) => {
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error('Username is already taken');
    }
    const user = new User({ name, username, password });
    await user.save();

    return {
      message: 'User created successfully',
      user: { id: user._id, name: user.name, username: user.username },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const loginUser = async (username, password) => {
  try {
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
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
    throw new Error(error.message);
  }
};

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const userService = {
  createUser,
  loginUser,
  getUserById,
};

export { userService };
