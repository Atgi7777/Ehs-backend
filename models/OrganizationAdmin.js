// models/OrganizationAdmin.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const SystemAdmin = require('./SystemAdmin');

const OrganizationAdmin = sequelize.define('OrganizationAdmin', {
  user_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  assigned_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  status: {
    type: DataTypes.ENUM('active' , 'inactive'),
    defaultValue: 'active',
  },
  unassigned_at: {
    type: DataTypes.DATE,
  },
  profile: {
    type: DataTypes.JSON, // or STRING if you prefer plain text
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('Organization_admin'), // Example roles
    allowNull: false,
    defaultValue: 'Organization_admin',
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }, 
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

}, {
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

OrganizationAdmin.belongsTo(Organization, {
  foreignKey: 'organization_id',
  as: 'organization',
});

OrganizationAdmin.belongsTo(SystemAdmin, {
  foreignKey: 'system_admin_id',
  as: 'systemAdmin',
});

module.exports = OrganizationAdmin;
