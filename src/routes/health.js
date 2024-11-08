const express = require('express');
const { sequelize } = require('../app/models');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', async (req, res) => {
  let dbStatus = {
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
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    if (mongoose.connection.readyState === 1) {
      dbStatus.mongodb = 'healthy';
    } else {
      dbStatus.mongodb = 'error: connection not open';
    }
  } catch (error) {
    dbStatus.mongodb = `error: ${error.message}`;
  }

  if (dbStatus.postgres === 'healthy' && dbStatus.mongodb === 'healthy') {
    return res.status(200).json({
      message: 'API is up and running',
      status: 'success',
      databases: dbStatus,
    });
  } else {
    return res.status(500).json({
      message:
        'API is running, but there are issues with the database connections',
      status: 'error',
      databases: dbStatus,
    });
  }
});

module.exports = router;
