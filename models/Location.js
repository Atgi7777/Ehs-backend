// models/Location.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const InstructionHistory = require("./InstructionHistory");

const Location = sequelize.define("Location", {
  location_detail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT(10, 6),
    allowNull: false,
  },
  latitude: {
    type: DataTypes.FLOAT(10, 6),
    allowNull: false,
  },
});

Location.belongsTo(InstructionHistory, {
  foreignKey: "history_id",
  as: "instructionHistory",
});

module.exports = Location;
