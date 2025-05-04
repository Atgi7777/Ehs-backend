const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Organization = require("./Organization");
const OrganizationAdmin = require("./OrganizationAdmin");

const SafetyEngineer = sequelize.define(
  "SafetyEngineer",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    professional_degree: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    profile: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
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

    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    phone:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    timestamps: false,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// ХАБ инженер → байгууллага
SafetyEngineer.belongsTo(Organization, {
  foreignKey: "organization_id",
  as: "organization",
});

// ХАБ инженер → админ
SafetyEngineer.belongsTo(OrganizationAdmin, {
  foreignKey: "organization_admin_id",
  as: "organizationAdmin",
});

module.exports = SafetyEngineer;
