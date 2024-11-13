import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Sequelize, DataTypes } from 'sequelize';
import User from './user.js';
import Post from './post.js';
import Comment from './comment.js';
import databaseConfig from '../../configs/database.js';

dotenv.config();

let sequelize = null;
let models = null;

const initializeConnections = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connection established successfully.');

    sequelize = new Sequelize(
      databaseConfig.database,
      databaseConfig.username,
      databaseConfig.password,
      {
        host: databaseConfig.host,
        dialect: databaseConfig.dialect,
        define: databaseConfig.define,
        logging: false,
      }
    );

    await sequelize.authenticate();
    console.log('PostgreSQL connection established successfully.');

    const UserModel = User.init(mongoose);
    models = {
      User: UserModel,
      Post: Post.init(sequelize, DataTypes),
      Comment: Comment.init(sequelize, DataTypes),
    };

    Object.values(models)
      .filter((model) => typeof model.associate === 'function')
      .forEach((model) => model.associate(models));

    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');

    return models;
  } catch (error) {
    console.error('Error initializing connections:', error);
    throw error;
  }
};

export const getModels = () => {
  if (!models) {
    throw new Error('Models were not initialized. Call initialize() first.');
  }
  return models;
};

export const initialize = initializeConnections;
export { sequelize };
