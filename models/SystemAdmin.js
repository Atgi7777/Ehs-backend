// models/SystemAdmin.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemAdmin = sequelize.define('SystemAdmin', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },  
  profile: {
    type: DataTypes.JSON, // or STRING if you prefer plain text
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('System_admin'), // Example roles
    allowNull: false,
    defaultValue: 'System_admin',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  timestamps: false,  // Don't use Sequelize's automatic timestamps
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = SystemAdmin;
