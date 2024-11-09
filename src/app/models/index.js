import dotenv from 'dotenv';
import { Sequelize, DataTypes } from 'sequelize';
import { User } from './user.js';

dotenv.config();

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: process.env.DB_DIALECT,
  logging: false,
  define: {
    timestamps: true,
  },
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

export { sequelize, User, DataTypes };
