const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Issue = require('./Issue');
const SafetyEngineer = require('./SafetyEngineer');

const IssueComment = sequelize.define('IssueComment', {
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  }
}, {
  timestamps: false,
  createdAt: 'created_at',
});

// Харилцаа
IssueComment.belongsTo(Issue, {
  foreignKey: 'issue_id',
  as: 'issue',
});

IssueComment.belongsTo(SafetyEngineer, {
  foreignKey: 'safetyEngineer_id',
  as: 'safetyEngineer',
});

module.exports = IssueComment;
