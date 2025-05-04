

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