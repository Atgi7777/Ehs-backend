// models/InstructionHistory.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const SafetyInstruction = require('./SafetyInstruction');
const Group = require('./Group');

const InstructionHistory = sequelize.define('InstructionHistory', {
  instruction_status: {
    type: DataTypes.ENUM('not-viewed', 'reviewed', 'viewed'),
    defaultValue: 'viewed',
  }, 
  date_viewed: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  notes: {
  type: DataTypes.STRING,
  allowNull: true,
},

  viewed_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
});

InstructionHistory.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee',
});

InstructionHistory.belongsTo(SafetyInstruction, {
  foreignKey: 'instruction_id',
  as: 'instruction',
});

InstructionHistory.belongsTo(Group, {
  foreignKey: 'group_id',
  as: 'group',
});

module.exports = InstructionHistory;
