import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Sequelize, DataTypes } from 'sequelize';
import { User } from './user.js';
import definePost from './post.js';
import defineComment from './comment.js';
import databaseConfig from '../../configs/database.js';

dotenv.config();

let sequelize;
let models = null;

const initializeConnections = async () => {
  try {
    // Inicializar MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connection established successfully.');

    // Inicializar PostgreSQL usando a configuração importada
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

    // Inicializar modelos
    const Post = definePost(sequelize);
    const Comment = defineComment(sequelize);

    // Armazenar modelos
    models = {
      User,
      Post,
      Comment,
    };

    // Executar associações
    Object.values(models)
      .filter((model) => typeof model.associate === 'function')
      .forEach((model) => model.associate(models));

    // Sincronizar os modelos com o banco de dados
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
    throw new Error(
      'Models não foram inicializados. Chame initialize() primeiro.'
    );
  }
  return models;
};

export const initialize = initializeConnections;
export { sequelize, DataTypes };
