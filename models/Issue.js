const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const SafetyEngineer = require('./SafetyEngineer');

const Issue = sequelize.define('Issue', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'resolved'),
    defaultValue: 'pending',
  },
  
  
  reporter_id: { 
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // 🔥 Шинэ нэмэгдэж буй талбарууд
  location: { 
    type: DataTypes.STRING, 
    allowNull: true, 
  },
  cause: { 
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
}, {
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

Issue.belongsTo(Employee, { foreignKey: 'reporter_id', as: 'reporter' });
Issue.belongsTo(SafetyEngineer, { foreignKey: 'assigned_id', as: 'assignedEngineer' });

module.exports = Issue;
