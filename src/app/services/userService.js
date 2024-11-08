const { User } = require('../models'); // Importando o modelo User
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authConfig = require('../../configs/auth'); // Importando a configuração de auth
const dotenv = require('dotenv');

dotenv.config();

const createUser = async (name, username, password) => {
  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('Username is already taken');
    }

    const user = await User.create({
      name,
      username,
      password,
    });

    return {
      message: 'User created successfully',
      user: { id: user.id, name: user.name, username: user.username },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const loginUser = async (username, password) => {
  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
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
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createUser,
  loginUser,
  getUserById,
};
