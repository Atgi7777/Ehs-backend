const express = require('express');
const router = express.Router();
const { OrganizationAdmin , Organization , SystemAdmin, Employee } = require('../models');
const authenticateToken = require('../middleware/auth');
const orgController = require('../controllers/orgController'); // ← энэ мөрийг нэмэх шаардлагатай
const authOrgController = require('../controllers/authOrgController');




//dashboard 
router.get('/dashboard', authenticateToken, orgController.getDashboardStats);

router.get('/orgDashboard', authenticateToken, orgController.getOrgDashboard);

// organization дээрх мэдээллийг авах 
router.get('/organizations', authenticateToken, orgController.getOrganizations);


router.get('/organizations/:id/status', authenticateToken, orgController.getOrganizationStatusById);





router.get('/organization/:id/admins', authenticateToken, async (req, res) => {
  try {
    const admins = await OrganizationAdmin.findAll({
      where: { organization_id: req.params.id },
    });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Алдаа гарлаа', error: err.message });
  }
});


router.delete('/organization-admin/:id', authenticateToken, async (req, res) => {
  try {
    await OrganizationAdmin.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Админ амжилттай устгагдлаа' });
  } catch (err) {
    res.status(500).json({ message: 'Устгахад алдаа гарлаа', error: err.message });
  }
});

router.put('/organization/:id', async (req, res) => {
  try {
    console.log('🧾 Ирсэн өгөгдөл:', req.body); // ← ЭНЭГ НЭМЭЭРЭЙ

    const org = await Organization.findByPk(req.params.id);
    if (!org) return res.status(404).json({ message: 'Байгууллага олдсонгүй' });

    org.name = req.body.name;
    org.address = req.body.address;
    org.phone = req.body.phone;
    org.email = req.body.email;
    org.activity_type = req.body.activity_type;

    if (req.body.profile) {
      org.profile = req.body.profile;
    }

    await org.save();
    res.json(org);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Алдаа гарлаа' });
  }
});


router.get('/profile/:id', authenticateToken, orgController.getProfile);

router.delete('/organizations/:id', authenticateToken, orgController.deleteOrganization);

router.get('/organizations/:id', authenticateToken, orgController.getOrganizationById);
module.exports = router;
