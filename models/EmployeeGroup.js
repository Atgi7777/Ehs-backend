// models/EmployeeGroup.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const Group = require('./Group');

const EmployeeGroup = sequelize.define('EmployeeGroup', {
  assigned_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  }
  
});

EmployeeGroup.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee',
});

EmployeeGroup.belongsTo(Group, {
  foreignKey: 'group_id',
  as: 'group',
});

module.exports = EmployeeGroup;
