const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Issue = require('./Issue');

const IssueImage = sequelize.define('IssueImage', {
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  timestamps: false,
});

IssueImage.belongsTo(Issue, {
  foreignKey: 'issue_id',
  as: 'issue',
});

module.exports = IssueImage;
