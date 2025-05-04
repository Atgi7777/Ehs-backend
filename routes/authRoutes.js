//routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authOrgController = require('../controllers/authOrgController');
const safetyController = require('../controllers/safetyController');
const SystemAdmin = require('../models/SystemAdmin');
const upload = require('../middleware/upload');
const InstructionPage = require('../models/InstructionPage');

const  authenticateToken   = require('../middleware/auth'); 

// Системийн админ нэвтрэх бүртгүүлэх
router.post('/register', authController.register);
router.post('/login', authController.login);

// Системийн админы хийх үйлдлүүд
// Байгуулга болон админ үүсгэх

router.post('/create-organization-with-admin', authenticateToken , authOrgController.createOrganizationWithAdmin);

router.post('/add-admin-to-organization/:id', authenticateToken , authOrgController.addAdminToExistingOrganization);

// router.post('/add-admin-to-organization/:id' , authenticateToken , authOrgController.addAdminToExistingOrganization);

//байгууллагын админ
router.post('/login-org-admin', authOrgController.loginAdmin);




router.get('/verify-email', authController.verifyEmail);

router.get('/verify-orgadmin', authOrgController.verifyEmail);



router.post('/login_emp', safetyController.login);



module.exports = router;
 