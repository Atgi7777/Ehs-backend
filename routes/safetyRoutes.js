//safetyRoutes.js
const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');
const upload = require('../middleware/upload');
const authenticateToken = require('../middleware/auth');



router.post('/makeGroup', authenticateToken, upload.single('profile'), safetyController.makeGroup); // ✅

router.get('/groups', authenticateToken, safetyController.getGroups);

// Бүлгийн ажилчид
router.get('/groups/:groupId/members', authenticateToken, safetyController.getGroupMembers);

// Байгууллагын ажилчид
router.get('/organization', authenticateToken, safetyController.getOrganizationInfo);

  // Байгууллагын ажилчид
router.get('/organization/members', authenticateToken, safetyController.getOrganizationEmployees);

//бүлэгт ажилтан нэмэх
router.post('/groups/:groupId/addmembers', authenticateToken, safetyController.addGroupMembers);

router.get('/me', authenticateToken, safetyController.getCurrentSafetyEngineerProfile);

// routes/safetyEngineer.js
router.put(
  '/edit-me',
  authenticateToken,
  upload.single('avatar'), // ← avatar гэдэг нэртэй файл авна
  safetyController.updateCurrentSafetyEngineerProfile
);

router.post('/creat-instruction' , authenticateToken , safetyController.createSafetyInstruction );

router.post(
  '/instruction/:id/pages',
  upload.single('file'),
  safetyController.addInstructionPage
); 

// routes/safetyRoutes.js
router.get('/instructions', authenticateToken, safetyController.getAllInstructions);

router.get('/:id', safetyController.getSafetyEngineerById);


module.exports = router;
