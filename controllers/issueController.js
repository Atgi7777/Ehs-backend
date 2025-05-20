const { Issue, IssueImage, SafetyEngineer ,Employee , IssueComment } = require('../models');

const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');


// GET /api/issues/:id
exports.getIssueDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const issue = await Issue.findByPk(id, {
      include: [
        {
          model: IssueImage,
          as: 'images',
          attributes: ['id', 'image_url', 'uploaded_at'],
        },
        {
          model: IssueComment,
          as: 'comments',
          attributes: ['id', 'content', 'user_type', 'created_at'],
          include: [
            {
              model: Employee,
              as: 'employee',
              attributes: ['id', 'name'],
            },
            {
              model: SafetyEngineer,
              as: 'engineer',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: Employee, // 🌟 Ажилтныг (reporter) холбоотой оруулж ирнэ
          as: 'reporter',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!issue) {
      return res.status(404).json({ message: 'Асуудал олдсонгүй.' });
    }

    res.json(issue);
  } catch (error) {
    console.error('Issue дэлгэрэнгүй татах алдаа:', error);
    res.status(500).json({ message: 'Дотоод серверийн алдаа.' });
  }
};


exports.createIssue = async (req, res) => {
  try {
    const user = req.user;
    const organizationId = user.organization_id;

    if (!organizationId) {
      return res.status(400).json({ message: 'Байгууллагын ID олдсонгүй' });
    }

    const { title, description, location, cause } = req.body;

    const newIssue = await Issue.create({
      title,
      description,
      location,
      cause,
      reporter_id: user.id,
      organization_id: organizationId,
    }); 

    // Зураг хадгалах хэсэг
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => ({
        issue_id: newIssue.id,
        image_url: `uploads/${file.filename}`,
        uploaded_at: new Date(),
      }));

      await IssueImage.bulkCreate(images);
    }

    res.status(201).json(newIssue);
  } catch (error) {
    console.error('📣 Мэдэгдэл үүсгэхэд алдаа:', error);
    res.status(500).json({ message: 'Мэдэгдэл үүсгэхэд алдаа гарлаа' });
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


// PUT /api/issues/:id/update
exports.updateIssueStatus = async (req, res) => {
  console.log('==== ISSUE STATUS API CALLED ====');

  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status талбарыг заавал явуулна уу!' });
  }

  try {
    // 1. Issue-г олж авна
    const issue = await Issue.findByPk(id);

    if (!issue) {
      console.log('Issue олдсонгүй!');
      return res.status(404).json({ message: 'Асуудал олдсонгүй.' });
    }

    // 2. Статус зөв эсэхийг шалгах (хүсвэл энэ хэсгийг ч авч болно)
    const allowedStatuses = ['pending', 'in_progress', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Буруу төлөв илгээлээ.' });
    }

    // 3. Статус шинэчлэх
    console.log('Хуучин статус:', issue.status);
    issue.status = status;
    await issue.save();
    console.log('Шинэ статус DB-д хадгаллаа:', issue.status);

    // 4. Хариу буцаах
    res.json({ message: 'Төлөв амжилттай шинэчлэгдлээ.', issue });
  } catch (error) {
    console.error('Issue шинэчлэх алдаа:', error);
    res.status(500).json({ message: 'Дотоод серверийн алдаа.' });
  }
};













exports.getOrganizationIncidents = async (req, res) => {
  try {
    const user = req.user;
    const organizationId = user.organization_id;

    if (!organizationId) {
      return res.status(400).json({ message: 'Байгууллагын ID олдсонгүй' });
    }

    const incidents = await Issue.findAll({
      where: { organization_id: organizationId },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Employee,              // ⬅️ Энэ нь User model байх ёстой (reporter_id FK)
          as: 'reporter',           // ⬅️ Association alias (Issue.belongsTo(User, { as: 'reporter', foreignKey: 'reporter_id' }))
          attributes: ['name'], // хүссэн талбараа бичиж болно
        }
      ]
    });

    res.json(incidents);
  } catch (error) {
    console.error('Байгууллагын бүх осол авахад алдаа:', error);
    res.status(500).json({ message: 'Дотоод серверийн алдаа.' });
  }
};

 
exports.getReportsChartData = async (req, res) => {
  try {
    const user = req.user;
    const organizationId = user.organization_id;

    if (!organizationId) {
      return res.status(400).json({ message: 'Байгууллагын ID олдсонгүй' });
    }

    const reports = await Issue.findAll({
      where: { organization_id: organizationId },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'], // 🔥 created_at-ыг зөвхөн DATE болгож авна
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: ['date'],
      order: [['date', 'ASC']],
      raw: true,
    });

    res.json(reports);
  } catch (error) {
    console.error('Тайлангийн график дата авахад алдаа:', error);
    res.status(500).json({ message: 'Тайлан график дата авахад алдаа гарлаа' });
  }
};

exports.updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const { title, description, location, cause, status } = req.body;
    if (title) issue.title = title;
    if (description) issue.description = description;
    if (location) issue.location = location;
    if (cause) issue.cause = cause;
    if (status) issue.status = status;
    await issue.save();
console.log('deletedImageIds[]:', req.body['deletedImageIds[]']);
console.log(req.body);

    let deletedIds = [];
const deletedImageIds = req.body['deletedImageIds[]'] || req.body.deletedImageIds;
if (deletedImageIds) {
  console.log('deletedImageIds:', deletedImageIds);

  if (Array.isArray(deletedImageIds)) {
    deletedIds = deletedImageIds.map(Number);
  } else {
    deletedIds = [Number(deletedImageIds)];
  }
  if (deletedIds.length > 0) {
    console.log('Will delete image ids:', deletedIds);
    await IssueImage.destroy({ where: { id: deletedIds } });
  }
}


    // 🟢 Шинэ зураг upload хийсэн бол хадгална
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => ({
        issue_id: issue.id,
        image_url: `uploads/${file.filename}`,
        uploaded_at: new Date(),
      }));
      await IssueImage.bulkCreate(images);
    }

    res.json(issue);
  } catch (error) {
    console.error('📣 Мэдэгдэл шинэчлэхэд алдаа:', error);
    res.status(500).json({ message: 'Мэдэгдэл шинэчлэхэд алдаа гарлаа' });
  }
};


exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // 1. IssueComment-уудыг устгах
    await IssueComment.destroy({
      where: { issue_id: issue.id }
    });

    // 2. IssueImage-уудыг устгах (хэрвээ байгаа бол)
    await IssueImage.destroy({
      where: { issue_id: issue.id }
    });

    // 3. Issue-г өөрийг нь устгах
    await issue.destroy();

    res.json({ message: 'Issue, comments, images deleted successfully!' });
  } catch (error) {
    console.error('Issue устгах үед алдаа:', error);
    res.status(500).json({ message: 'Issue устгах үед алдаа гарлаа' });
  }
};
// controllers/issueController.js
exports.countEmployeeIssues = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId required' });
    }

    // reporter_id баганаар тоолно
    const count = await Issue.count({
      where: { reporter_id: employeeId }
    });

    res.json({ count });
  } catch (error) {
    console.error('Issue тоолох үед алдаа:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

 

