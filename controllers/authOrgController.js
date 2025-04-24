const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const transporter = require('../utils/email');
const verifyEmailGeneric = require('../utils/verify');
const { SystemAdmin, Organization, OrganizationAdmin } = require('../models');
require('dotenv').config();
const multer = require('multer');
const path = require('path');


 
exports.createOrganizationWithAdmin = async (req, res) => {
  try {
    const { systemAdminId, orgName, orgAddress, orgEmail, activityType, adminUsername, adminPhone, adminEmail  } = req.body;

    // Системийн админ шалгах (Токеноор системийн админ нэвтэрсэн эсэхийг шалгана)
    // if (req.user.id !== systemAdminId) {
    //   return res.status(403).json({ message: 'Танай нэвтэрсэн системийн админ биш байна.' });
    //}

    // 1. Системийн админ шалгах
    const systemAdmin = await SystemAdmin.findByPk(systemAdminId);
    if (!systemAdmin) return res.status(404).json({ message: 'Системийн админ олдсонгүй.' });


    const orgProfileImage = req.files['orgProfile']?.[0]?.filename || null;
    const adminProfileImage = req.files['adminProfile']?.[0]?.filename || null;


    // 2. Байгуулга үүсгэх
    const existingOrg = await Organization.findOne({ where: { email: orgEmail } });
    if (existingOrg) return res.status(400).json({ message: 'Энэ имэйл хаягаар байгууллага аль хэдийн бүртгэгдсэн байна.' });

    const organization = await Organization.create({
      name: orgName,
      address: orgAddress,
      email: orgEmail,
      activity_type: activityType,
      profile: orgProfileImage,
      system_admin_id: systemAdmin.id,
    });

    // 3. Байгууллагын админ үүсгэх
    const existingAdmin = await OrganizationAdmin.findOne({ where: { email: adminEmail } });
    if (existingAdmin) return res.status(400).json({ message: 'Энэ имэйл хаягтай админ бүртгэгдсэн байна.' });

    const hashedPassword = await bcrypt.hash('defaultPassword123', 10); // Админы нууц үгийг хэшлэх

    const organizationAdmin = await OrganizationAdmin.create({
      user_name: adminUsername,
      phone: adminPhone,
      email: adminEmail,
      password: hashedPassword,
      profile: adminProfileImage, 
      system_admin_id: systemAdmin.id,
      organization_id: organization.id,
    });

    // JWT токен үүсгэх
    const token = jwt.sign({ id: organizationAdmin.id , organization_id : organization.id}, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Баталгаажуулалтын URL үүсгэх
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-orgadmin?token=${token}`;

    // Имэйл илгээх
    await transporter.sendMail({
      from: `"EHS System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: 'Verify your email',
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({ message: 'Байгууллага болон админ амжилттай үүсгэгдлээ. Имэйлээ шалгаж баталгаажуулна уу.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 



exports.addAdminToExistingOrganization = async (req, res) => {
  try {
    const { name, email, phone, systemAdminID } = req.body;
    const organizationId = req.params.id;

    // 1. Имэйл давхцах шалгалт
    const existingAdmin = await OrganizationAdmin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Энэ имэйл хаягтай админ бүртгэгдсэн байна.' });
    }

    // 2. Системийн админ бүртгэл шалгах
    const existingSystemAdmin = await SystemAdmin.findByPk(systemAdminID);
    if (!existingSystemAdmin) {
      return res.status(400).json({ message: 'Системийн админ бүртгэлгүй байна.' });
    }

    // 3. Нууц үг хэшлэх
    const hashedPassword = await bcrypt.hash('defaultPassword123', 10);

   

    const profile = req.files['adminProfile']?.[0]?.filename || null;

const organizationAdmin = await OrganizationAdmin.create({
  user_name: name,
  phone,
  email,
  password: hashedPassword,
  profile: profile, // ← JSON string хэлбэр
  system_admin_id: systemAdminID,
  organization_id: organizationId,
});


  

  
    // 6. Имэйл баталгаажуулах линк үүсгэх (хэрвээ хэрэглэж байвал)
    const token = jwt.sign({ id: organizationAdmin.id , organization_id: organizationId}, process.env.JWT_SECRET, { expiresIn: '1d' });
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-orgadmin?token=${token}`;

    await transporter.sendMail({
      from: `"EHS System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `<p>Та бүртгэлээ баталгаажуулахын тулд <a href="${verificationUrl}">энд дарна уу</a>.</p>`,
    });

    res.status(201).json({ message: 'Амжилттай бүртгэгдлээ. Имэйлээ шалгана уу.' });
  } catch (error) {
    console.error('Admin нэмэх алдаа:', error);
    res.status(500).json({ error: error.message });
  }
};



exports.verifyEmail = async (req, res) => {
  verifyEmailGeneric(req, res, OrganizationAdmin);
};

  exports.loginAdmin = async (req, res) => {
    try {
      const { email, password } = req.body;  // Имэйл болон нууц үгийг авах
  
      // 1. Байгууллагын админ хэрэглэгчийг имэйлээр шалгах
      const user = await OrganizationAdmin.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'Байгууллагын админ олдсонгүй.' });
      }
  
      // 2. Нууц үгийг шалгах
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Нууц үг буруу байна.' });
      }
  
      // 3. JWT токен үүсгэх
      const token = jwt.sign({ id: user.id , role: user.role , organization_id: user.organization_id}, process.env.JWT_SECRET, { expiresIn: '1d' });
  
      // 4. Токен болон хэрэглэгчийн мэдээллийг буцаах
      res.status(200).json({
        message: 'Амжилттай нэвтэрлээ.',
        token: token,  // Токеныг буцаах
        user: {
          id: user.id,
          email: user.email,
          user_name: user.user_name,
          phone: user.phone,
          verified: user.verified,
          organization_id: user.organization_id,

        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Серверийн алдаа' });
    }
  };
  
  