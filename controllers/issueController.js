const { Issue, IssueImage, SafetyEngineer } = require('../models');
exports.createIssue = async (req, res) => {
  try {
    const { title, description, location, cause } = req.body;
    const reporterId = req.user.id;

    const issue = await Issue.create({
      title,
      description,
      location,
      cause,
      reporter_id: reporterId,
    });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await IssueImage.create({
          issue_id: issue.id,
          image_url: file.path, // серверт хадгалсан зам
        });
      }
    }

    res.status(201).json({ message: 'Мэдэгдэл амжилттай үүслээ.', issue });
  } catch (error) {
    console.error('Мэдэгдэл үүсгэхэд алдаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа.' });
  }
};
exports.getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.findAll({
      where: { reporter_id: req.user.id },
      order: [['created_at', 'DESC']],
    });

    res.json(issues);
  } catch (error) {
    console.error('Миний асуудлуудыг татахад алдаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа.' });
  }
};
