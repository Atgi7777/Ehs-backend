// models/Organization.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SystemAdmin = require('./SystemAdmin');  // Ensure the model is imported correctly
const OrganizationAdmin = require('./OrganizationAdmin');

const Organization = sequelize.define('Organization', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  }, 
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: { 
    type: DataTypes.STRING,
    allowNull: true,
  
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
   
  },
  activity_type: {
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
}, {
  timestamps: false,  // Don't use Sequelize's automatic timestamps
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

Organization.belongsTo(SystemAdmin, {
  foreignKey: 'system_admin_id',
  as: 'systemAdmin',
});



module.exports = Organization;
