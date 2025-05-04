const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SafetyEngineer = require('./SafetyEngineer');

const SafetyInstruction = sequelize.define('SafetyInstruction', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  number: {
    type: DataTypes.INTEGER,
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
},{
  tableName: 'safety_instructions',  // ✅ FK таарах болно
  timestamps: true,
  underscored: true,
});

SafetyInstruction.belongsTo(SafetyEngineer, {
  foreignKey: 'safetyEngineer_id',
  as: 'safetyEngineer',
});



module.exports = SafetyInstruction;
