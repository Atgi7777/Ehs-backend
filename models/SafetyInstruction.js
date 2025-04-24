// models/SafetyInstruction.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SafetyEngineer = require('./SafetyEngineer');

const SafetyInstruction = sequelize.define('SafetyInstruction', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'archived'),
    defaultValue: 'active',
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
});

SafetyInstruction.belongsTo(SafetyEngineer, {
  foreignKey: 'safetyEngineer_id',
  as: 'safetyEngineer',
});

module.exports = SafetyInstruction;
