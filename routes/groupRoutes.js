const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authenticateToken = require('../middleware/auth');

router.post('/group/:groupId/add-by-phone', authenticateToken, groupController.addEmployeeByPhone);
router.post('/group/:groupId/add-by-email', groupController.addEmployeeByEmail);

router.get('/employees/:id' , groupController.getEmployeeById );


router.delete('/group/:groupId/remove/:employeeId', groupController.removeEmployeeFromGroup);

module.exports = router;
