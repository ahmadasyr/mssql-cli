const { Sequelize } = require('sequelize');

module.exports = new Sequelize({
  dialect: 'mssql',
  dialectModule: require('tedious'),
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});
