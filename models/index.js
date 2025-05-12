// models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const SystemAdmin = require('./SystemAdmin');
const OrganizationAdmin = require('./OrganizationAdmin');
const SafetyEngineer = require('./SafetyEngineer');
const Group = require('./Group');
const SafetyInstruction = require('./SafetyInstruction');
const GroupInstruction = require('./GroupInstruction');
const EmployeeGroup = require('./EmployeeGroup');
const InstructionHistory = require('./InstructionHistory');
const Location = require('./Location');
const Signature = require('./Signature');
const Employee = require('./Employee');
const Organization = require('./Organization');
const InstructionPage = require('./InstructionPage');
const Issue = require('./Issue');
const IssueComment = require('./IssueComment');
const IssueImage = require('./IssueImage');

// Define associations
Organization.hasMany(Employee, { foreignKey: 'organization_id' });
Employee.belongsTo(Organization, { foreignKey: 'organization_id' });


module.exports = {
  sequelize,
  SystemAdmin,
  Organization,
  OrganizationAdmin,
  SafetyEngineer,
  Employee,
  Group,
  SafetyInstruction,
  GroupInstruction,
  EmployeeGroup,
  InstructionPage,
  InstructionHistory,
  Location,
  Signature,
  Issue,
  IssueComment,
  IssueImage
};


// Foreign key холбоо энд:
SafetyInstruction.hasMany(InstructionPage, {
  foreignKey: 'safetyInstruction_id',
});


InstructionHistory.hasMany(Signature, {
  foreignKey: 'history_id',
   as: 'signature',
});

InstructionHistory.hasMany(Location, {
  foreignKey: 'history_id',
   as: 'location',
});
Signature.belongsTo(Employee, {
foreignKey: 'employee_id',
  as: 'employee',
});

Signature.belongsTo(InstructionHistory, {
  foreignKey: 'history_id',
  as: 'instructionHistory',
});
Issue.hasMany(IssueImage, {
  foreignKey: 'issue_id',
  as: 'images',
});