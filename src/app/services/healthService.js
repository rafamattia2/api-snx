import { sequelize } from '../models/index.js';
import mongoose from 'mongoose';

const healthService = {
  async checkHealth() {
    const dbStatus = {
      postgres: 'not connected',
      mongodb: 'not connected',
    };

    try {
      await sequelize.authenticate();
      dbStatus.postgres = 'healthy';
    } catch (error) {
      dbStatus.postgres = `error: ${error.message}`;
    }

    try {
      if (mongoose.connection.readyState === 1) {
        dbStatus.mongodb = 'healthy';
      } else {
        dbStatus.mongodb = 'error: connection not open';
      }
    } catch (error) {
      dbStatus.mongodb = `error: ${error.message}`;
    }

    const isHealthy =
      dbStatus.postgres === 'healthy' && dbStatus.mongodb === 'healthy';

    return {
      message: isHealthy
        ? 'API is up and running'
        : 'API is running, but there are issues with the database connections',
      status: isHealthy ? 'success' : 'error',
      databases: dbStatus,
    };
  },
};

export default healthService;
