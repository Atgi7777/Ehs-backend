// models/index.js
const SystemAdmin = require('./SystemAdmin');
const OrganizationAdmin = require('./OrganizationAdmin');
const SafetyEngineer = require('./SafetyEngineer');
const Group = require('./Group');
const SafetyInstruction = require('./SafetyInstruction');
const GroupInstruction = require('./GroupInstruction');
const EmployeeGroup = require('./EmployeeGroup');
const File = require('./File');
const InstructionHistory = require('./InstructionHistory');
const Location = require('./Location');
const Signature = require('./Signature');
const Employee = require('./Employee');
const Organization = require('./Organization');
const Sequelize = require('sequelize');
const sequelize = require('../config/database');
// Add other models here


Organization.hasMany(Employee, { foreignKey: 'organization_id' });
Employee.belongsTo(Organization, { foreignKey: 'organization_id' });


module.exports = {
  sequelize,
  SystemAdmin , 
  Organization , 
  OrganizationAdmin,
  SafetyEngineer,
  Employee, 
  Group,
  SafetyInstruction,
  GroupInstruction,
  EmployeeGroup,
  File,
  InstructionHistory,
  Location,
  Signature
  // Add other models to export here
};

