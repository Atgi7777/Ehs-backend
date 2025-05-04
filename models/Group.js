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
  activity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  work_description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  work_detail: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  profile: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, {
  
  timestamps: true,      // createdAt, updatedAt автоматаар үүсгэнэ
  underscored: true,     // created_at, updated_at гэж нэрлэх болно
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
