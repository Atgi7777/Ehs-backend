//safetyController.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { SafetyEngineer  } = require('../models');





exports.login = async (req, res) => {
    try {
      console.log(req.body);
      const { email, password } = req.body;
  
      const user = await SafetyEngineer.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй.' });
  
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: 'Нууц үг буруу байна.' });
  
      const token = jwt.sign({ id: user.id, role: 'safety-engineer'  }, process.env.JWT_SECRET, { expiresIn: '2h' });
  
      res.status(200).json({
        token,
        message: 'Нэвтрэх амжилттай.',
        user: {
          id: user.id,
          email: user.email,
          username: user.name,
          role: 'safety-engineer',
        },
      });
    } catch (error) {
      console.error('❌ Login алдаа:', error);
      res.status(500).json({ error: error.message });
    }
  };


