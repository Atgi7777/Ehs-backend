const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { SystemAdmin, Organization, Employee, OrganizationAdmin } = require('../models');




exports.getDashboardStats = async (req, res) => {
  try {
    const organizations = await Organization.count();
    const employees = await Employee.count();

    
    const reports = 0;

    res.json({
      organizations,
      employees,
      reports
    });
  } catch (error) {
    console.error('📊 Dashboard мэдээлэл авахад алдаа:', error);
    res.status(500).json({ message: 'Дашбоардын мэдээлэл авахад алдаа гарлаа' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const admin = await SystemAdmin.findByPk(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Админ олдсонгүй' });
    }

    const orgCount = await Organization.count();
    const employeeCount = await Employee.count();

    res.json({
      user: admin.username,
      email: admin.email,
      phone: admin.phone,
      image: admin.profile, 
      joinedDate: admin.created_at ? admin.created_at.toISOString().split('T')[0] : null,
      employees: employeeCount,
      organizations: orgCount,
    });
  } catch (err) {
    console.error('❌ Профайл авах алдаа:', err);
    res.status(500).json({ message: 'Серверийн алдаа', error: err.message });
  }
};


exports.deleteOrganization = async (req, res) => {
  try {
    const org = await Organization.findByPk(req.params.id);

    if (!org) {
      return res.status(404).json({ message: 'Устгах байгууллага олдсонгүй' });
    }

    // Хамааралтай ажилчид, тайлан, тохиргоо гэх мэт устгах бол энд нэмнэ
    await Employee.destroy({ where: { organization_id: org.id } });
    // await Report.destroy({ where: { organization_id: org.id } });
  await OrganizationAdmin.destroy({ where :{organization_id: org.id}});
    await org.destroy();

    res.json({ message: 'Байгууллага амжилттай устгагдлаа.' });
  } catch (err) {
    console.error('Устгах үед алдаа:', err);
    res.status(500).json({ message: 'Устгах үйлдэл амжилтгүй боллоо', error: err.message });
  }
};



exports.getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: Employee,
          attributes: [],
        },
      ],
      group: ['Organization.id'],
      raw: true,
      nest: true,
    });

    const orgsWithEmployeeCount = await Promise.all(
      organizations.map(async (org) => {
        const employeeCount = await Employee.count({
          where: { organization_id: org.id },
        });
        return {
          ...org,
          employeeCount,
        };
      })
    );

    res.json(orgsWithEmployeeCount);
  } catch (error) {
    console.error('❌ Байгууллагын мэдээлэл татахад алдаа:', error);
    res.status(500).json({ message: 'Байгууллагын мэдээлэл татахад алдаа гарлаа' });
  }
};



exports.getOrganizationStatusById = async (req, res) => {
  const { id } = req.params;

  try {
    const organization = await Organization.findByPk(id);

    if (!organization) {
      return res.status(404).json({ message: 'Байгууллага олдсонгүй' });
    }

    const employeeCount = await Employee.count({
      where: { organization_id: id },
    });

    const activeUsers = await Employee.count({
      where: {
        organization_id: id,
        is_active: true, // Хэрвээ is_active талбар байгаа бол
      },
    });

    res.json({
      id: organization.id,
      employeeCount,
      activeUsers,
      updated_at: organization.updated_at,
    });
  } catch (error) {
    console.error('📛 Байгууллагын статус авахад алдаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
};
 



// controllers/systemAdminOrgController.js
exports.getOrganizationById = async (req, res) => {
  try {
    const org = await Organization.findByPk(req.params.id);

    if (!org) {
      return res.status(404).json({ message: 'Байгууллага олдсонгүй' });
    }

    res.json({
      name: org.name,
      logo: org.profile || null,
      industry: org.activity_type || 'Тодорхойгүй',
      registered: org.created_at?.toISOString().split('T')[0] || '',
      phone: org.phone || '',
      email: org.email || '',
      address: org.address ||'',
    });
  } catch (err) {
    console.error('Байгууллага татах алдаа:', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
};



