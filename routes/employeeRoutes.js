const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/EmployeeController');
const upload = require('../middleware/upload');
const authenticateToken = require('../middleware/auth');
const { Employee } = require('../models');

router.get('/me', authenticateToken, employeeController.getCurrentEngineerProfile);

router.put('/edit-me', authenticateToken, upload.single('avatar'), employeeController.updateEmployeeProfile);

router.get('/groups', authenticateToken, employeeController.getEmployeeGroups);

router.get('/count/org/:organizationId', async (req, res) => {
  const { organizationId } = req.params;
  try {
    const count = await Employee.count({ where: { organization_id: organizationId } });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ count: 0 });
  }
});


module.exports = router;