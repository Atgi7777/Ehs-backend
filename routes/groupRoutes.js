const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authenticateToken = require('../middleware/auth');

const upload = require('../middleware/upload');

router.post('/group/:groupId/add-by-phone', authenticateToken, groupController.addEmployeeByPhone);
router.post('/group/:groupId/add-by-email', groupController.addEmployeeByEmail);

router.get('/employees/:id' , groupController.getEmployeeById );


router.delete('/group/:groupId/remove/:employeeId', groupController.removeEmployeeFromGroup);

router.get('/:id', groupController.getGroupById);

router.put('/:groupId' ,upload.single('image'),  groupController.updateGroup);

router.delete('/:groupId', groupController.deleteGroup);



module.exports = router;
