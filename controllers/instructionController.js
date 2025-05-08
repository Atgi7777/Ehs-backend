

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const {
  Group,
  GroupInstruction,
  SafetyInstruction,
  InstructionPage
} = require("../models"); 

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



// Зааварчилгааг шинэчлэх
exports.updateInstruction = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    number,
    description,
    start_date,
    end_date,
  } = req.body;

  try {
    const instruction = await SafetyInstruction.findByPk(id);
    if (!instruction) {
      return res.status(404).json({ message: 'Зааварчилгаа олдсонгүй' });
    }

    await instruction.update({
      title,
      number,
      description,
      start_date,
      end_date,
    });

    res.json({ message: 'Амжилттай шинэчиллээ' });
  } catch (err) {
    console.error('⚠️ Зааварчилгаа шинэчлэхэд алдаа:', err);
    res.status(500).json({ message: 'Шинэчлэхэд алдаа гарлаа' });
  }
};

// Шинэ хуудас үүсгэх
exports.createPage = async (req, res) => {
  const {
    safetyInstruction_id,
    description,
    page_order,
    location,
    image_url,
    video_url,
    audio_url,
  } = req.body;

  try {
    const page = await InstructionPage.create({
      safetyInstruction_id,
      description,
      page_order,
      location,
      image_url,
      video_url,
      audio_url,
    });

    res.status(201).json({ message: 'Хуудас амжилттай нэмлээ', page });
  } catch (err) {
    console.error('⚠️ Хуудас үүсгэхэд алдаа:', err);
    res.status(500).json({ message: 'Хуудас үүсгэхэд алдаа гарлаа' });
  }
};



exports.addInstructionPage = async (req, res) => {
  try {
    const instructionId = req.params.id;
    const { description, page_order, location } = req.body;
    const file = req.file;

    let image_url = null;
    let audio_url = null;
    let video_url = null;

    if (file) {
      const mime = file.mimetype;
      const relativePath = path.join(file.destination.split('/').pop(), file.filename);

      if (mime.startsWith("image/")) {
        image_url = relativePath;
      } else if (mime.startsWith("audio/")) {
        audio_url = relativePath;
      } else if (mime.startsWith("video/")) {
        video_url = relativePath;
      }
    }

    const newPage = await InstructionPage.create({
      safetyInstruction_id: instructionId,
      description,
      page_order,
      location,
      image_url,
      audio_url,
      video_url,
    });

    res.status(201).json(newPage);
  } catch (err) {
    console.error("📛 Error saving instruction page:", err);
    res.status(500).json({
      message: "Алдаа: Хуудас хадгалах үед алдаа гарлаа",
    });
  }
};



// controllers/instructionController.js
exports.deletePage = async (req, res) => {
  const { id } = req.params;

  try {
    const page = await InstructionPage.findByPk(id);
    if (!page) return res.status(404).json({ message: 'Хуудас олдсонгүй' });

    await page.destroy();
    res.json({ message: 'Амжилттай устгалаа' });
  } catch (err) {
    console.error('❌ Устгах үед алдаа:', err);
    res.status(500).json({ message: 'Устгах үед алдаа гарлаа' });
  }
};
