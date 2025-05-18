// routes/safetyTraining.js
const express = require("express");
const router = express.Router();
const upload = require('../middleware/upload');
const { SafetyTraining, TrainingAttendance, Employee } = require('../models');

// POST /api/safety-trainings — сургалт үүсгэнэ
router.post("/", upload.single("poster"), async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      training_date,
      duration_hours,
     
      organization_id,
      engineer_id,
    } = req.body;
    let poster = null;
    if (req.file) {
      poster = { url: `/uploads/${req.file.filename}` };
    }
    const training = await SafetyTraining.create({
      title,
      description,
      location,
      training_date,
      duration_hours,
      organization_id,
      engineer_id,
      poster,
    });
    res.status(201).json(training);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/safety-trainings — бүх сургалтуудыг авах
router.get("/", async (req, res) => {
  try {
    const trainings = await SafetyTraining.findAll({
      order: [["training_date", "DESC"]],
    });
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// /api/safety-trainings/organization/:organizationId

router.get("/organization/:organizationId", async (req, res) => {
  try {
    const { organizationId } = req.params;
    const trainings = await SafetyTraining.findAll({
      where: { organization_id: organizationId },
      order: [["training_date", "DESC"]],
    });
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const training = await SafetyTraining.findByPk(id, {
      include: [
        { association: 'organization' }, // байгууллагын мэдээлэл хамт авах
        { association: 'engineer' },     // инженерийн мэдээлэл хамт авах
      ]
    });
    if (!training) return res.status(404).json({ message: "Сургалт олдсонгүй" });
    res.json(training);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/:id/attend', async (req, res) => {
  const trainingId = req.params.id;
  const employeeId = req.body.employee_id; // POST body-оос авна

  if (!employeeId) {
    return res.status(401).json({ message: 'Ажилтны мэдээлэл олдсонгүй!' });
  }

  try {
    // Аль хэдийн оролцсон бол update, байхгүй бол create
    let attendance = await TrainingAttendance.findOne({
      where: { training_id: trainingId, employee_id: employeeId }
    });
    if (attendance) {
      attendance.attended = true;
      await attendance.save();
    } else {
      attendance = await TrainingAttendance.create({
        training_id: trainingId,
        employee_id: employeeId,
        attended: true,
      });
    }
    return res.json({ success: true, attendance });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Системийн алдаа' });
  }
});


router.get('/count/org-by-employee/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  console.log('emp' , employeeId);
  try {
    // Ажилтныг олж байгууллагын ID-г авна
    const employee = await Employee.findByPk(employeeId);
    if (!employee) return res.status(404).json({ message: 'Ажилтан олдсонгүй' });

    // Тэр байгууллагын бүх сургалтыг тоолно
    const count = await SafetyTraining.count({
      where: { organization_id: employee.organization_id }
    });

    res.json({ count });
  } catch (e) {
    res.status(500).json({ message: 'Сургалтын тоо авахад алдаа гарлаа' });
  }
});


router.get('/count/created-by/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const count = await SafetyTraining.count({ where: { engineer_id: userId } });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ count: 0 });
  }
});

module.exports = router;
