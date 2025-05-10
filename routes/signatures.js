// routes/signatures.js

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
