

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require('moment-timezone'); // 👉 заавал суулгасан байх ёстой

require("dotenv").config();
const {
  Group,
  GroupInstruction,
  SafetyInstruction,
  InstructionPage , InstructionHistory , Employee, Signature, Location , SafetyEngineer
} = require("../models"); 
const { Op } = require('sequelize');

exports.shareInstructionToGroups = async (req, res) => {
  const { instructionId } = req.params;
  const instructionIdNumber = Number(instructionId);
  const { groupIds } = req.body;

  if (!Array.isArray(groupIds) || groupIds.length === 0) {
    return res.status(400).json({ error: 'groupIds талбарт хамгийн багадаа 1 ID байх шаардлагатай' });
  }

  try {
    console.log("backend received:", instructionIdNumber, groupIds);

    const instruction = await SafetyInstruction.findByPk(instructionIdNumber);
    if (!instruction) {
      return res.status(404).json({ error: `Зааварчилгаа ID=${instructionIdNumber} олдсонгүй` });
    }

    const createdRecords = [];

    for (const groupId of groupIds) {
      const groupIdNumber = Number(groupId);

      // Давхардсан хос insert хийхгүй байхаар шалгана
      const exists = await GroupInstruction.findOne({
        where: {
          group_id: groupIdNumber,
          safetyInstruction_id: instructionIdNumber,
        },
      });

      if (!exists) {
        const record = await GroupInstruction.create({
          group_id: groupIdNumber,
          safetyInstruction_id: instructionIdNumber,
        });
        createdRecords.push(record);
      }
    }

    res.status(200).json({
      message: 'Амжилттай илгээгдлээ',
      instructionId: instructionIdNumber,
      groupIds,
      inserted: createdRecords.length,
      data: createdRecords,
    });
  } catch (err) {
    console.error('Илгээхэд алдаа:', err);
    res.status(500).json({ error: 'Дотоод серверийн алдаа', details: err.message });
  }
};


exports.getSlidesByInstructionId = async (req, res) => {
    try {
      const { id } = req.params;
  
      const slides = await InstructionPage.findAll({
        where: { safety_instruction_id: id },
        order: [['id', 'ASC']], // дарааллаар
      });
  
      if (!slides || slides.length === 0) {
        return res.status(404).json({ message: 'Слайд олдсонгүй' });
      }
  
      res.status(200).json(slides);
    } catch (error) {
      console.error('⚠️ Слайд татахад алдаа:', error);
      res.status(500).json({ message: 'Дотоод серверийн алдаа' });
    }
  };



  // exports.getSharedGroups = async (req, res) => {
  //   try {
  //     const { id: instructionId } = req.params;
  
  //     const shared = await GroupInstruction.findAll({
  //       where: { safetyInstruction_id: instructionId },
  //       attributes: ['group_id'],
  //     });
  
  //     const groupIds = shared.map(g => g.group_id);
  //     res.json({ groupIds });
  //   } catch (err) {
  //     console.error('Shared groups fetch error:', err);
  //     res.status(500).json({ error: 'Дотоод серверийн алдаа' });
  //   }
  // };
  
  exports.getSharedGroups = async (req, res) => {
    try {
      const { id } = req.params;
      const instructions = await GroupInstruction.findAll({
        where: { safetyInstruction_id: id },
        attributes: ['group_id'],
      });
  
      const groupIds = instructions.map(inst => inst.group_id);
      res.json({ groupIds }); // ⬅ зөв format
    } catch (error) {
      console.error('Илгээгдсэн бүлэг авахад алдаа:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  

  exports.getInstructionsByGroup = async (req, res) => {
    const { groupId } = req.params;
  
    try {
      const instructions = await GroupInstruction.findAll({
        where: { group_id: groupId },
        include: [
          {
            model: SafetyInstruction,
            as: 'safetyInstruction',
          },
        ],
        order: [['assigned_at', 'DESC']],
      });
  
      const formatted = instructions.map((entry) => entry.safetyInstruction);
  
      res.status(200).json(formatted);
    } catch (err) {
      console.error('Бүлгийн зааварчилгаа татах алдаа:', err);
      res.status(500).json({ message: 'Дотоод серверийн алдаа' });
    }
  };

  exports.unshareGroupFromInstruction = async (req, res) => {
    const { id: instructionId, groupId } = req.params;
  
    try {
      const deleted = await GroupInstruction.destroy({
        where: {
          safetyInstruction_id: instructionId,
          group_id: groupId,
        },
      });
  
      if (deleted === 0) { 
        return res.status(404).json({ message: 'Харгалзах бүртгэл олдсонгүй' });
      }
  
      res.json({ message: 'Бүлэг амжилттай хасагдлаа' });
    } catch (error) {
      console.error('📛 Зааварчилгаанаас бүлэг хасахад алдаа:', error);
      res.status(500).json({ message: 'Серверийн алдаа' });
    }
  };



// ✅ Зааварчилгаа устгах (DELETE /api/instructions/:id)
exports.deleteInstruction = async (req, res) => {
  try {
    const { id } = req.params;

    const instruction = await SafetyInstruction.findByPk(id);
    if (!instruction) return res.status(404).json({ message: 'Зааварчилгаа олдсонгүй' });

    await instruction.destroy();

    res.json({ message: 'Амжилттай устгагдлаа' });
  } catch (err) {
    console.error('❌ Устгах алдаа:', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
};



exports.getInstructionWithPages = async (req, res) => {
  const { id } = req.params;

  try {
    const instruction = await SafetyInstruction.findByPk(id, {
      include: [
        {
          model: InstructionPage,
          as: 'InstructionPages', // ⬅️ энэ нь models/index.js дахь alias-тай таарах ёстой
          order: [['page_order', 'ASC']],
        },
      ],
    });

    if (!instruction) {
      return res.status(404).json({ message: 'Зааварчилгаа олдсонгүй' });
    }

    res.json(instruction);
  } catch (err) {
    console.error('⚠️ Зааварчилгаа болон хуудас татахад алдаа:', err);
    res.status(500).json({ message: 'Алдаа гарлаа' });
  }
};

exports.updateInstructionWithPages = async (req, res) => {
  const id = req.params.id;

  try {
    // 1. Instruction update
    const { title, number, description, start_date, end_date } = req.body;
    await SafetyInstruction.update({ title, number, description, start_date, end_date }, {
      where: { id },
    });

    // 2. Delete old pages
    await InstructionPage.destroy({ where: { safetyInstruction_id: id } });

    // 3. Parse pages from req.body
    const pages = JSON.parse(req.body.pages); // string -> object

    const newPages = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const page_order = i + 1;

      const image = req.files[`image_${i}`]?.[0];
      const video = req.files[`video_${i}`]?.[0];
      const audio = req.files[`audio_${i}`]?.[0];

      newPages.push({
        page_order,
        description: page.description || '',
        location: page.location || '',
        image_url: image ? `/uploads/${image.filename}` : '',
        video_url: video ? `/uploads/videos/${video.filename}` : '',
        audio_url: audio ? `/uploads/audios/${audio.filename}` : '',
        safetyInstruction_id: id,
      });
    }

    await InstructionPage.bulkCreate(newPages);

    res.json({ message: 'Амжилттай хадгалагдлаа' });
  } catch (err) {
    console.error('Хадгалах үед алдаа:', err);
    res.status(500).json({ message: 'Хадгалах үед алдаа гарлаа' });
  }
};


exports.updateInstructionWithMedia = async (req, res) => {
  const id = req.params.id;
  const { title, number, description, start_date, end_date, pages } = JSON.parse(req.body.data);

  try {
    await SafetyInstruction.update({ title, number, description, start_date, end_date }, { where: { id } });

    await InstructionPage.destroy({ where: { safetyInstruction_id: id } });

    const newPages = [];

    for (let i = 0; i < pages.length; i++) {
      newPages.push({
        page_order: i + 1,
        description: pages[i].description,
        location: pages[i].location,
        safetyInstruction_id: id,
        image_url: req.files[`image_url_${i}`]?.[0]?.path || '',
        audio_url: req.files[`audio_url_${i}`]?.[0]?.path || '',
        video_url: req.files[`video_url_${i}`]?.[0]?.path || '',
      });
    }

    await InstructionPage.bulkCreate(newPages);

    res.json({ message: 'Инструкция болон медиа амжилттай хадгалагдлаа' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Алдаа гарлаа' });
  }
};




exports.getInstructionHistoriesByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id; // 🔥 authenticateToken дээрээ req.user.id дамжуулж байгаа гэж үзэж байна

    if (!date) {
      return res.status(400).json({ message: 'Огноо дамжуулаагүй байна.' });
    }

    // 1. Монголын цагаар (Asia/Ulaanbaatar) UTC-руу хөрвүүлэх
    const startDate = moment.tz(date, 'Asia/Ulaanbaatar').startOf('day').utc().toDate();
    const endDate = moment.tz(date, 'Asia/Ulaanbaatar').endOf('day').utc().toDate();

    // 2. InstructionHistory-г шүүж авах
    const histories = await InstructionHistory.findAll({
      where: {
        viewed_at: {
          [Op.between]: [startDate, endDate],
        },
        employee_id: userId, // зөвхөн тухайн хэрэглэгчийн түүх
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'position'],
        },
        {
          model: SafetyInstruction,
          as: 'instruction',
          attributes: ['id', 'title', 'description', 'start_date', 'end_date'],
          include: [
            {
              model: SafetyEngineer,
              as: 'safetyEngineer',
              attributes: ['id', 'name', 'email', 'phone'],
            },
          ],
        },
        {
          model: Signature,
          as: 'signature',
          attributes: ['id', 'signature_photo', 'signed_at'],
        },
        {
          model: Location,
          as: 'location',
          attributes: ['id', 'location_detail', 'latitude', 'longitude'],
        },
      ],
      order: [['viewed_at', 'ASC']],
    });

    res.status(200).json(histories);
  } catch (error) {
    console.error('Түүх татахад алдаа:', error);
    res.status(500).json({ message: 'Түүх авахад алдаа гарлаа', error: error.message });
  }
};


// 📜 Нэг зааварчилгааны түүх дэлгэрэнгүй авах

exports.getInstructionHistoryDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await InstructionHistory.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'position'],
        },
        {
          model: SafetyInstruction,
          as: 'instruction',
          attributes: ['id', 'title', 'description', 'start_date', 'end_date', 'number'],
          include: [
            {
              model: SafetyEngineer,
              as: 'safetyEngineer',
              attributes: ['id', 'name', 'email', 'phone'],
            },
          ],
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name'],
        },
        {
          model: Signature,
          as: 'signature',
          attributes: ['id', 'signature_photo', 'signed_at'],
        },
        {
          model: Location,
          as: 'location',
          attributes: ['id', 'location_detail', 'latitude', 'longitude'],
        },
      ],
    });

    if (!history) {
      return res.status(404).json({ message: 'Түүх олдсонгүй' });
    }

    res.status(200).json(history);
  } catch (error) {
    console.error('⚠️ Дэлгэрэнгүй түүх татахад алдаа:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
