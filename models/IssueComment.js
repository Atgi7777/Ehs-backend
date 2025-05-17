// models/IssueComment.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Issue = require('./Issue');
const Employee = require('./Employee');
const SafetyEngineer = require('./SafetyEngineer');

const IssueComment = sequelize.define('IssueComment', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  user_type: {
    type: DataTypes.ENUM('employee', 'engineer'),
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  issue_id: { type: DataTypes.INTEGER, allowNull: false },

}, {
  timestamps: false,
  createdAt: 'created_at',
});

IssueComment.belongsTo(Issue, { foreignKey: 'issue_id', as: 'issue' });
IssueComment.belongsTo(Employee, { foreignKey: 'user_id', as: 'employee', constraints: false });
IssueComment.belongsTo(SafetyEngineer, { foreignKey: 'user_id', as: 'engineer', constraints: false });

module.exports = IssueComment;
