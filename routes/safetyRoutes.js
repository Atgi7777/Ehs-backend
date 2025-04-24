//safetyRoutes.js
const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');
const authenticateToken = require('../middleware/auth');

router.post('/login', safetyController.login);



module.exports = router;
