const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../utils/email');
const verifyEmailGeneric = require('../utils/verify');
const { SystemAdmin } = require('../models');
require('dotenv').config();

// 📌 Системийн админ бүртгүүлэх
exports.register = async (req, res) => {
  try { 
    const { username, password, email  } = req.body;

    // ✅ Имэйл формат шалгах
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Имэйл хаяг буруу байна.' });
    }

    // ✅ Имэйл давхцах эсэх шалгах
    const existing = await SystemAdmin.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email хаяг бүртгэгдсэн байна.' });
    }

    // ✅ Нууц үг хэшлэх
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Админ үүсгэх
    const user = await SystemAdmin.create({
      username,
      password: hashedPassword,
      email,
      role: 'System_admin',
    });

    // ✅ Баталгаажуулах токен үүсгэх
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // ✅ Баталгаажуулалтын линк
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

    // ✅ Имэйл илгээх
    await transporter.sendMail({
      from: `"EHS System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `<p>Welcome! <br> Please verify your email by clicking <a href="${verificationUrl}">this link</a>.</p>`,
    });

    res.status(201).json({ message: 'Admin бүртгэгдлээ. Имэйлээ шалган баталгаажуулна уу.' });
  } catch (error) {
    console.error('❌ Бүртгэл алдаа:', error);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Системийн админ нэвтрэх
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await SystemAdmin.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй.' });

    if (!user.verified) {
      return res.status(403).json({ message: 'Имэйл баталгаажаагүй байна.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Нууц үг буруу байна.' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.status(200).json({
      token,
      message: 'Нэвтрэх амжилттай.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Login алдаа:', error);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Email баталгаажуулах (verify-email)
exports.verifyEmail = async (req, res) => {
  verifyEmailGeneric(req, res, SystemAdmin);
};
