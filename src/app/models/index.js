const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
const User = require('./user');

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

module.exports = { sequelize, User, DataTypes };
