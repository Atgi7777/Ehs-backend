const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/EmployeeController');
const upload = require('../middleware/upload');
const authenticateToken = require('../middleware/auth');

router.get('/me', authenticateToken, employeeController.getCurrentEngineerProfile);

router.put('/edit-me', authenticateToken, upload.single('avatar'), employeeController.updateEmployeeProfile);

router.get('/groups', authenticateToken, employeeController.getEmployeeGroups);

module.exports = router;