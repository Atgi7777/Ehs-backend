// models/GroupInstruction.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Group = require('./Group');
const SafetyInstruction = require('./SafetyInstruction');

const GroupInstruction = sequelize.define('GroupInstruction', {
  assigned_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
});


GroupInstruction.belongsTo(Group, {
  foreignKey: 'group_id',
  as: 'group',
});

GroupInstruction.belongsTo(SafetyInstruction, {
  foreignKey: 'safetyInstruction_id',
  as: 'safetyInstruction',
});

module.exports = GroupInstruction;
