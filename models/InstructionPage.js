const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SafetyInstruction = require('./SafetyInstruction');


const InstructionPage = sequelize.define('InstructionPage', {
  safetyInstruction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  page_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  audio_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  video_url: {
    type: DataTypes.STRING,
    allowNull: true,
  }, 
}, {
  timestamps: true,
  underscored: true,
});

InstructionPage.belongsTo(SafetyInstruction, {
  foreignKey: 'safetyInstruction_id',
  onDelete: 'CASCADE',
  as: 'safetyInstruction',
});



module.exports = InstructionPage;
