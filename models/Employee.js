// models/Employee.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const OrganizationAdmin = require('./OrganizationAdmin');

const Employee = sequelize.define('Employee', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile: {
    type: DataTypes.JSON, // or STRING if you prefer plain text
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM("Эрэгтэй", "Эмэгтэй", "Бусад"),
    allowNull: true,
  },

  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
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
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }, 
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at', 
});

Employee.belongsTo(OrganizationAdmin, {
  foreignKey: 'organization_admin_id',
  as: 'organizationAdmin',
});

Employee.belongsTo(Organization, {
  foreignKey: 'organization_id',
  as: 'organization',
});

module.exports = Employee;
