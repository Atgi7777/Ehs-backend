// models/Location.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const InstructionHistory = require('./InstructionHistory');

const Location = sequelize.define('Location', {
  county: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location_detail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
});

Location.belongsTo(InstructionHistory, {
  foreignKey: 'history_id',
  as: 'instructionHistory',
});

module.exports = Location;
