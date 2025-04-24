// routes/uploadRoute.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { createOrganizationWithAdmin , addAdminToExistingOrganization } = require('../controllers/authOrgController');
const authenticateToken = require('../middleware/auth');
const { SystemAdmin} = require('../models');


router.post(
  '/create-organization-with-admin',
  authenticateToken,
  upload.fields([
    { name: 'orgProfile', maxCount: 1 },
    { name: 'adminProfile', maxCount: 1 },
  ]),
  createOrganizationWithAdmin
);

router.post(
  '/add-admin-to-organization/:id',
  authenticateToken,
  upload.fields([{ name: 'adminProfile', maxCount: 1 }]), // 🔥 Name нь formData доторх field name-тай таарна
  addAdminToExistingOrganization
);

 
// Upload API
router.post('/upload-image', upload.single('profileImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Зураг байхгүй байна' });

  // URL-ийг буцаана
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});


// system-admin update profile image
router.put('/profile/:id/upload', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if image is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Зураг оруулна уу' });
    }

    // Update image in DB
    const admin = await SystemAdmin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: 'Админ олдсонгүй' });
    }
    

    admin.profile = req.file.filename;
    console.log(admin.profile);
    await admin.save();

    res.status(200).json(admin);
  } catch (error) {
    console.error('Зураг хадгалах алдаа:', error);
    res.status(500).json({ message: 'Дотоод серверийн алдаа' });
  }
});


// POST /api/auth/upload
router.post('/upload', upload.single('profileImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Файл илгээгдсэнгүй' });
  }

  const oldImage = req.body.oldImage;
  const fs = require('fs');
  const path = require('path');

  // Хуучин зургийг устгах
  if (oldImage) {
    const oldPath = path.join(__dirname, '..', 'uploads', oldImage);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath); // устгана
    }
  }

  // Шинэ зургийн нэрийг буцаана
  res.status(200).json({ filename: req.file.filename });
});




router.post('/users/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Зураг ирээгүй байна' });
    }

    return res.status(200).json({
      message: 'Зураг амжилттай хадгалагдлаа',
      profile: {
        image: req.file.filename,
        url: `/uploads/${req.file.filename}`
      }
    });
  } catch (err) {
    console.error('Upload алдаа:', err);
    return res.status(500).json({ error: 'Серверийн алдаа' });
  }
});



module.exports = router;
 