const express = require('express');
const router = express.Router();
const { OrganizationAdmin , Organization , Employee , SafetyEngineer } = require('../models');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');


// ✅ Нэг админ мэдээлэл авах
router.get('/organization-admin/:id', authenticateToken, async (req, res) => {
  try {
    const admin = await OrganizationAdmin.findByPk(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Админ олдсонгүй' });
    }
    res.json(admin);
  } catch (err) {
    console.error('Админ авах алдаа:', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// ✅ Админ шинэчлэх
router.put('/organization-admin/:id', authenticateToken, async (req, res) => {
  try {
    const admin = await OrganizationAdmin.findByPk(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Админ олдсонгүй' });
    }

    // update fields
    admin.name = req.body.name;
    admin.email = req.body.email;
    admin.phone = req.body.phone;

    await admin.save();
    res.json(admin);
  } catch (err) {
    console.error('Админ шинэчлэх алдаа:', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// ✅ Админ устгах
router.delete('/organization-admin/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await OrganizationAdmin.destroy({
      where: { id: req.params.id },
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Админ олдсонгүй' });
    }

    res.json({ message: 'Амжилттай устгалаа' });
  } catch (err) {
    console.error('Админ устгах алдаа:', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});





// aдмины мэдээлэл авах
router.get('/organization/:orgId', authenticateToken, async (req, res) => {

  console.log('Requested orgId:', req.params.orgId);
  try {
    const orgId = req.params.orgId;

    const admins = await OrganizationAdmin.findAll({
      where: { organization_id: orgId },
      attributes: ['id', 'user_name', 'phone', 'email', 'status', 'assigned_at' , 'profile']
    });

    if (!admins.length) {
      return res.status(404).json({ message: 'Админ олдсонгүй.' });
    }

    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/employees', authenticateToken, async (req, res) => {
  try {
    const { organization_id } = req.user;

    const employees = await Employee.findAll({
      where: { organization_id },
      attributes: ['id', 'name', 'email', 'position', 'profile', 'created_at'],
    });

    const engineers = await SafetyEngineer.findAll({
      where: { organization_id },
      attributes: ['id', 'name', 'email', 'professional_degree', 'status', 'profile', 'created_at'],
    });

    res.status(200).json({ employees, engineers });
  } catch (err) {
    console.error('❌ Алдаа:', err);
    res.status(500).json({ message: 'Ажилчдын мэдээлэл авах үед сервер дээр алдаа гарлаа' });
  }
});


// хаб инженер мэдээлэл өөрчлөх 
router.put('/engineer/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const engineerId = req.params.id;
    const { id: adminId, organization_id } = req.user;

    const engineer = await SafetyEngineer.findOne({
      where: {
        id: engineerId,
        organization_id,
        organization_admin_id: adminId
      }
    });

    if (!engineer) {
      return res.status(404).json({ message: 'Инженер олдсонгүй эсвэл хандах эрхгүй' });
    }

    const {
      name,
      email,
      phone,
      professional_degree,
      gender,
      age,
      address,
      department
    } = req.body;

    const profileImage = req.file ? { image: req.file.filename } : engineer.profile;

    await engineer.update({
      name,
      email,
      phone,
      professional_degree,
      gender,
      age,
      address,
      department,
      profile: profileImage,
      updated_at: new Date()
    });

    res.json({ message: 'Амжилттай засварлагдлаа' });
  } catch (error) {
    console.error('ХАБ инженер засах үед алдаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// GET: Байгууллагын админ зөвхөн өөрийн байгууллагын ХАБ инженерийн мэдээлэл харах
router.get('/engineer/:id', authenticateToken, async (req, res) => {
  try {
    const engineerId = req.params.id;
    const orgAdminId = req.user.id;
    const orgId = req.user.organization_id;

    const engineer = await SafetyEngineer.findOne({
      where: {
        id: engineerId,
        organization_admin_id: orgAdminId,
        organization_id: orgId
      }
    });

    if (!engineer) {
      return res.status(404).json({ message: 'Инженер олдсонгүй эсвэл хандах эрхгүй байна' });
    }

    res.json(engineer);
  } catch (error) {
    console.error('ХАБ инженер авах үед алдаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});


//Ажилтны мэдээлэл авах
router.get('/employee/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: adminId, organization_id } = req.user;

    const employee = await Employee.findOne({
      where: {
        id,
        organization_id,
        organization_admin_id: adminId
      }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Ажилтан олдсонгүй эсвэл хандах эрхгүй' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Ажилтан авах үед алдаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});
// Ажилтны мэдээлэл засах
router.put('/employee/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { id: adminId, organization_id } = req.user;

    const employee = await Employee.findOne({
      where: {
        id,
        organization_id,
        organization_admin_id: adminId,
      },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Ажилтан олдсонгүй эсвэл хандах эрхгүй' });
    }

    const {
      name,
      email,
      phone,
      position,
      department,
      gender,
      age,
      address,
    } = req.body;

    const profileImage = req.file ? { image: req.file.filename } : employee.profile;

    await employee.update({
      name,
      email,
      phone,
      position,
      department,
      gender,
      age,
      address,
      profile: profileImage,
      updated_at: new Date(),
    });

    res.json({ message: 'Амжилттай засварлагдлаа' });
  } catch (error) {
    console.error('Ажилтан засах үед алдаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});


module.exports = router;
