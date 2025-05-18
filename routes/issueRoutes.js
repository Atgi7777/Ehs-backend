const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const { Issue, IssueComment, Employee, SafetyEngineer } = require('../models');

// multer тохиргоо (зураг upload хийхэд)
const upload = require('../middleware/upload');

router.post('/issues', authenticateToken, upload.array('images', 10) , issueController.createIssue);
router.get('/issues/my-issues', authenticateToken, issueController.getMyIssues);


router.patch('/issues/:id/update', authenticateToken , issueController.updateIssueStatus);
router.get('/issues/:id', issueController.getIssueDetail);


router.get('/getIssue', authenticateToken  , issueController.getOrganizationIncidents);
router.get('/reports-chart', authenticateToken, issueController.getReportsChartData);


router.put('/issues/:id', authenticateToken, upload.array('images', 10), issueController.updateIssue);
router.delete('/issues/:id', authenticateToken , issueController.deleteIssue);


// GET /api/issues/:id/comments?page=1&limit=20
router.get('/issues/:id/comments', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const comments = await IssueComment.findAll({
    where: { issue_id: req.params.id },
    order: [['created_at', 'ASC']],
    limit,
    offset,
    include: [
      { model: Employee, as: 'employee', attributes: ['name', 'profile'] },
      { model: SafetyEngineer, as: 'engineer', attributes: ['name', 'profile'] },
    ]
  });
  const mapped = comments.map(c => ({
    id: c.id,
    content: c.content,
    user_type: c.user_type,
    user_id: c.user_id,
    user: c.user_type === 'engineer' ? c.engineer : c.employee,
    created_at: c.created_at,
  }));
  res.json(mapped);
});



router.get('/issues/:id/comment', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const comments = await IssueComment.findAll({
    where: { issue_id: req.params.id },
    order: [['created_at', 'DESC']],
    limit,
    offset,
    include: [
      { model: Employee, as: 'employee', attributes: ['name', 'profile'] },
      { model: SafetyEngineer, as: 'engineer', attributes: ['name', 'profile'] },
    ]
  });
  const mapped = comments.map(c => ({
    id: c.id,
    content: c.content,
    user_type: c.user_type,
    user_id: c.user_id,
    user: c.user_type === 'engineer' ? c.engineer : c.employee,
    created_at: c.created_at,
  }));
  res.json(mapped);
});



router.post('/issues/:id/comments', async (req, res) => {
  const { content, user_type, user_id } = req.body;
  const issueId = req.params.id;

  const comment = await IssueComment.create({
    content,
    user_type,
    user_id,
    issue_id: issueId,
    created_at: new Date(),
  });
console.log(user_type);
  let user = null;
  if (user_type === 'engineer') {
    user = await SafetyEngineer.findByPk(user_id);
  } else {
    user = await Employee.findByPk(user_id);
  }
  const commentWithUser = {
    id: comment.id,
    content,
    user_type,
    user_id, // ← энэ мөрийг заавал нэм!!!
    user: user ? { name: user.name, profile: user.profile } : null,
    created_at: comment.created_at,
  };

  // Socket push!
  const io = req.app.get('io');
  io.to(`issue_${issueId}`).emit('receiveComment', commentWithUser);

  res.json(commentWithUser);
});


router.get('/count/:employeeId', issueController.countEmployeeIssues);



router.get('/count/org/:organizationId', async (req, res) => {
  const { organizationId } = req.params;
  try {
    const count = await Issue.count({ where: { organization_id: organizationId } });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ count: 0 });
  }
});





module.exports = router;
