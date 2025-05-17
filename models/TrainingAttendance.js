// models/TrainingAttendance.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Employee = require("./Employee");
const SafetyTraining = require("./SafetyTraining");

const TrainingAttendance = sequelize.define("TrainingAttendance", {
  attended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // false = зөвхөн бүртгүүлсэн, true = оролцсон
  },
  registered_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  }
}, {
  timestamps: false
});

TrainingAttendance.belongsTo(Employee, {
  foreignKey: "employee_id",
  as: "employee"
});
TrainingAttendance.belongsTo(SafetyTraining, {
  foreignKey: "training_id",
  as: "training"
});

module.exports = TrainingAttendance;
