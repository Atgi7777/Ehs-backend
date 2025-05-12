// models/Signature.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const InstructionHistory = require('./InstructionHistory');

const Signature = sequelize.define('Signature', {
  signature_photo: {
    type: DataTypes.TEXT('long'), 
    allowNull: false,
  },
  signed_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
});



module.exports = Signature;
