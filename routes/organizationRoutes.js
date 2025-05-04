const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
const authenticateToken = require('../middleware/auth');

router.get('/:id', authenticateToken, orgController.getOrganizationById);



module.exports = router;



