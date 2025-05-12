// config/database.js
const { Sequelize } = require('sequelize');

// Replace 'ehs' with your actual database name
const sequelize = new Sequelize('ehs', 'tugu', 'StrongPassword123!', {
  host: 'localhost',  // Use your MySQL host, 'localhost' is fine for local
  dialect: 'mysql',   // We're using MySQL
  logging: false,   
  timezone: '+08:00',   // Optional, set to true to see SQL queries in the console
});

module.exports = sequelize;

