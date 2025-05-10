const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Issue = require('./Issue');

const IssueImage = sequelize.define('IssueImage', {
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {      // 🔥 Зураг бүр дээр өөрийн тайлбар
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  }
}, {
  timestamps: false,
  createdAt: 'created_at',
});

IssueImage.belongsTo(Issue, {
  foreignKey: 'issue_id',
  as: 'issue',
});

module.exports = IssueImage;
