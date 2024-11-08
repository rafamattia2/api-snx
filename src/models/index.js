// src/models/index.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(process.env.POSTGRES_URI); // Use sua URI de conexão com o PostgreSQL

// Exemplo de modelo
const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Exportar o sequelize e os modelos
module.exports = { sequelize, User };
