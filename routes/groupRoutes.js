const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authenticateToken = require('../middleware/auth');

const upload = require('../middleware/upload');

router.post('/group/:groupId/add-by-phone', authenticateToken, groupController.addEmployeeByPhone);
router.post('/group/:groupId/add-by-email', groupController.addEmployeeByEmail);

router.get('/employees/:id' , groupController.getEmployeeById );


router.delete('/:groupId/remove/:employeeId', groupController.removeEmployeeFromGroup);

router.get('/:id', groupController.getGroupById);

router.put('/:groupId' ,upload.single('image'),  groupController.updateGroup);

router.delete('/:groupId', groupController.deleteGroup);

router.get('/:groupId/instructions', groupController.getInstructionsByGroup);

router.get('/groups/:id',authenticateToken, groupController.getGroupDetail);


module.exports = router;
