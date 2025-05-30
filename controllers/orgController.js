const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { SystemAdmin, Organization, Employee, OrganizationAdmin , SafetyEngineer , Issue} = require('../models');


 const { Op } = require('sequelize'); 

exports.getDashboardStats = async (req, res) => {
  try {
    // ❗ systemAdminId шалгах шаардлагагүй болсон
    // const user = req.user; 

    // 1️⃣ Бүх байгууллагуудыг авна
    const organizations = await Organization.findAll({
      attributes: ['id']
    });

    const organizationIds = organizations.map(org => org.id);

    if (organizationIds.length === 0) {
      return res.json({
        organizations: 0,
        employees: 0,
        reports: 0
      });
    }

    // 2️⃣ Бүх байгууллагуудын ажилчдын нийт тоо (Employee)
    const employeeCount = await Employee.count({
      where: {
        organization_id: {
          [Op.in]: organizationIds
        }
      }
    });

    // 3️⃣ Бүх байгууллагуудын ХАБ инженерүүдийн тоо (SafetyEngineer)
    const safetyEngineerCount = await SafetyEngineer.count({
      where: {
        organization_id: {
          [Op.in]: organizationIds
        }
      }
    });

    // 4️⃣ Бүх байгууллагуудын нийт админ (OrganizationAdmin)
    const organizationAdminCount = await OrganizationAdmin.count({
      where: {
        organization_id: {
          [Op.in]: organizationIds
        }
      }
    });

    const employees = employeeCount + safetyEngineerCount + organizationAdminCount; // ✅ Нийт ажилчид + ХАБ инженерүүд + админ

    // 5️⃣ Бүх байгууллагын нийт мэдэгдэл (Issue)
    const reports = await Issue.count({
      where: {
        organization_id: {
          [Op.in]: organizationIds
        }
      }
    });

    res.json({
      organizations: organizationIds.length, // нийт байгууллагын тоо
      employees,                              // нийт ажилчид
      reports                                 // нийт мэдэгдэл
    });

  } catch (error) {
    console.error('📊 Dashboard мэдээлэл авахад алдаа:', error);
    res.status(500).json({ message: 'Дашбоардын мэдээлэл авахад алдаа гарлаа' });
  }
};





exports.getOrgDashboard = async (req, res) => {
  try {
    const user = req.user; 
    const organizationId = user.organization_id; // ✅ Байгууллагын админы харьяалсан байгууллага

    if (!organizationId) {
      return res.status(400).json({ message: 'Байгууллагын ID олдсонгүй' });
    }

    // 1️⃣ Байгууллагын ажилчдын нийт тоо (Employee)
    const employeeCount = await Employee.count({
      where: { organization_id: organizationId }
    });

    // 2️⃣ Байгууллагын ХАБ инженерүүдийн нийт тоо (SafetyEngineer)
    const safetyEngineerCount = await SafetyEngineer.count({
      where: { organization_id: organizationId }
    });

    const employees = employeeCount + safetyEngineerCount; // 🔥 Нийт ажилтан

    // 3️⃣ Байгууллагад бүртгэгдсэн нийт Issue
    const incidents = await Issue.count({
      where: { organization_id: organizationId }
    });

    // 4️⃣ Тайлангийн тоо -> Хатуу 5 тавина
    const reports = 5;

    res.json({
      employees,
      reports,
      incidents
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



