// // routes/signatures.js

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const Signature = require('../models/Signature');
const Location = require('../models/Location');
const InstructionHistory = require('../models/InstructionHistory');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { signature_photo, latitude, longitude, location_detail, employee_id, group_id, instruction_id } = req.body;
    console.log(req.body);

    if (!signature_photo || !latitude || !longitude || !employee_id || !group_id || !instruction_id) {
      return res.status(400).json({ message: 'Бүх талбаруудыг бөглөнө үү.' });
    }

    // 1. Эхлээд InstructionHistory үүсгэнэ
    const history = await InstructionHistory.create({
      employee_id: employee_id,
      group_id: group_id,
      instruction_id: instruction_id,
      instruction_status: 'viewed',
      date_viewed: new Date(),
    });

    // 2. Дараа нь Signature үүсгэнэ
    const newSignature = await Signature.create({
      signature_photo: signature_photo,
      employee_id: employee_id,
      history_id: history.id,
    });

    // 3. Мөн Location үүсгэнэ
    const newLocation = await Location.create({
      location_detail: location_detail,
      latitude: latitude,
      longitude: longitude,
      history_id: history.id,
    });

    res.status(201).json({
      message: 'Амжилттай хадгаллаа!',
      signature: newSignature,
      location: newLocation,
      instructionHistory: history,
    });
  } catch (error) {
    console.error('Signature хадгалах үед алдаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа.' });
  }
});

module.exports = router;








// // дараа хэрэглэж үзнэ хахаха 
// const express = require('express');
// const router = express.Router();
// const authenticateToken = require('../middleware/auth');
// const Signature = require('../models/Signature');
// const Location = require('../models/Location');
// const InstructionHistory = require('../models/InstructionHistory');
// const fs = require('fs');
// const path = require('path');
// const { v4: uuidv4 } = require('uuid'); // Файл нэр уникаль болгоно

// router.post('/', authenticateToken, async (req, res) => {
//   try {
//     const { signature_photo, latitude, longitude, location_detail, employee_id, group_id, instruction_id } = req.body;
//     console.log('Body:', req.body);

//     if (!signature_photo || !latitude || !longitude || !employee_id || !group_id || !instruction_id) {
//       return res.status(400).json({ message: 'Бүх талбаруудыг бөглөнө үү.' });
//     }

//     // ✅ 1. Эхлээд InstructionHistory үүсгэнэ
//     const history = await InstructionHistory.create({
//       employee_id: employee_id,
//       group_id: group_id,
//       instruction_id: instruction_id,
//       instruction_status: 'viewed',
//       date_viewed: new Date(),
//     });

//     // ✅ 2. Signature зургийг файл болгон хадгалах
//     let signaturePhotoUrl = null;

//     if (signature_photo.startsWith('data:image')) {
//       const matches = signature_photo.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
//       if (!matches || matches.length !== 3) {
//         return res.status(400).json({ message: 'Зургийн формат алдаатай байна.' });
//       }

//       const imageBuffer = Buffer.from(matches[2], 'base64');
//       const filename = `${uuidv4()}.jpg`;
//       const uploadDir = path.join(__dirname, '..', 'uploads', 'signatures');
//       const filePath = path.join(uploadDir, filename);

//       // Фолдер байхгүй бол үүсгэнэ
//       fs.mkdirSync(uploadDir, { recursive: true });

//       fs.writeFileSync(filePath, imageBuffer);

//       signaturePhotoUrl = `${process.env.SERVER_URL}/uploads/signatures/${filename}`;
//     }

//     // ✅ 3. Signature үүсгэнэ (file URL-г хадгална)
//     const newSignature = await Signature.create({
//       signature_photo: signaturePhotoUrl,
//       employee_id: employee_id,
//       history_id: history.id,
//     });

//     // ✅ 4. Location үүсгэнэ
//     const newLocation = await Location.create({
//       location_detail: location_detail,
//       latitude: latitude,
//       longitude: longitude,
//       history_id: history.id,
//     });

//     res.status(201).json({
//       message: 'Амжилттай хадгаллаа!',
//       signature: newSignature,
//       location: newLocation,
//       instructionHistory: history,
//     });
//   } catch (error) {
//     console.error('Signature хадгалах үед алдаа:', error);
//     res.status(500).json({ message: 'Серверийн алдаа.' });
//   }
// });

// module.exports = router;
