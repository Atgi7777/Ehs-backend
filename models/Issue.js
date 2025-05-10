const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const Group = require('./Group');

const Issue = sequelize.define('Issue', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  status: {
  type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'rejected'),
  defaultValue: 'pending',
},

}, {
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// --- Харилцаа (Relations)
Issue.belongsTo(Employee, { foreignKey: 'created_by', as: 'employee' });
Issue.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });

module.exports = Issue;
