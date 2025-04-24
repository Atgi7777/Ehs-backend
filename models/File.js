// models/File.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SafetyInstruction = require('./SafetyInstruction');

const File = sequelize.define('File', {
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  file_description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

File.belongsTo(SafetyInstruction, {
  foreignKey: 'safetyInstruction_id',
  as: 'safetyInstruction',
});

module.exports = File;
