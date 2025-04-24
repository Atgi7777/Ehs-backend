// models/Group.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SafetyEngineer = require('./SafetyEngineer');
const Organization = require('./Organization');

const Group = sequelize.define('Group', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  work_description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  profile: {
    type: DataTypes.JSON, // or STRING if you prefer plain text
    allowNull: true,
  }
});

Group.belongsTo(SafetyEngineer, {
  foreignKey: 'safetyEngineer_id',
  as: 'safetyEngineer',
});

Group.belongsTo(Organization, {
  foreignKey: 'organization_id',
  as: 'organization',
});

module.exports = Group;
