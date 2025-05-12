const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');

// multer тохиргоо (зураг upload хийхэд)
const upload = require('../middleware/upload');

router.post('/issues', authenticateToken, upload.array('images', 10) , issueController.createIssue);
router.get('/issues/my-issues', authenticateToken, issueController.getMyIssues);

module.exports = router;
