const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authenticateToken = require('../middleware/auth');
const Employee = require('../models/Employee');
const SafetyEngineer = require('../models/SafetyEngineer');
const bcrypt = require('bcrypt');

router.post('/register', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name, email, phone, password, professional_degree, status ,role , position} = req.body;

    const profileImage = req.file ? { image: req.file.filename } : null; // ✅ Зөв

    const { id: organization_admin_id, organization_id } = req.user;

    if (!['employee', 'Safety_engineer'].includes(role)) {
      return res.status(400).json({ message: 'Role буруу байна' });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'employee') {
      await Employee.create({
        name,
        email,
        phone,
        password: hashedPassword,
        profile: profileImage,
        position,
        organization_admin_id,
        organization_id,
      });
    } else {
      await SafetyEngineer.create({
        name,
        email,
        professional_degree: professional_degree || 'not set',
        status: status || 'active',
        password: hashedPassword,
        profile: profileImage,
        organization_admin_id,
        organization_id,
      });
    }

    res.status(201).json({ message: 'Амжилттай бүртгэгдлээ' });
  } catch (error) {
    console.error('❌ Хадгалах үед алдаа:', error);
    res.status(500).json({ message: 'Дотоод серверийн алдаа' });
  }
});

module.exports = router;
