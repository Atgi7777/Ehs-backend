// models/SafetyTraining.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const SafetyEngineer = require("./SafetyEngineer");
const Organization = require("./Organization");

const SafetyTraining = sequelize.define("SafetyTraining", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  training_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration_hours: {
    type: DataTypes.INTEGER,
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
 poster: {
  type: DataTypes.JSON,
  allowNull: true,
}


}, {
  timestamps: false,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

// Тухайн сургалт ямар байгууллагад хамаарах
SafetyTraining.belongsTo(Organization, {
  foreignKey: "organization_id",
  as: "organization"
});
// Сургалтыг ямар ХАБ инженер үүсгэсэн
SafetyTraining.belongsTo(SafetyEngineer, {
  foreignKey: "engineer_id",
  as: "engineer"
});

module.exports = SafetyTraining;
 