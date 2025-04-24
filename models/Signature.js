// models/Signature.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const InstructionHistory = require('./InstructionHistory');

const Signature = sequelize.define('Signature', {
  Signature_photo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  signed_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
});

Signature.belongsTo(Employee, {
  foreignKey: 'Employee_id',
  as: 'employee',
});

Signature.belongsTo(InstructionHistory, {
  foreignKey: 'history_id',
  as: 'instructionHistory',
});

module.exports = Signature;
