const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {
  Employee,EmployeeGroup , Group , TrainingAttendance , InstructionHistory
} = require("../models"); 
const upload = require("../middleware/upload");

exports.getCurrentEngineerProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Нэвтэрсэн хэрэглэгч олдсонгүй" });
    }

    const employee = await Employee.findOne({
      where: { id: userId },
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "position",
        "age",
        "gender",
        "address",
        "department",
        "profile",
        "organization_id",
        "organization_admin_id",
        "created_at",
        "updated_at"
      ],
      include: [
        { association: "organization", attributes: ["id", "name"] },
        { association: "organizationAdmin", attributes: ["id", "user_name"] },
      ],
    });

    if (!employee) {
      return res.status(404).json({ message: "Ажилтан олдсонгүй" });
    }

    const profile = employee.profile || {};
    const avatarFile = profile.avatar || profile.image || null;

    res.json({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      gender: employee.gender,
      age: employee.age,
      address: employee.address,
      department: employee.department,
      organization: employee.organization,
      organizationAdmin: employee.organizationAdmin,
      profile: avatarFile ? `/uploads/${avatarFile}` : null,
      created_at: employee.created_at,
      updated_at: employee.updated_at,
    });
  } catch (err) {
    console.error("Ажилтны профайл татах үед алдаа гарлаа:", err);
    res.status(500).json({ message: "Мэдээлэл татах үед алдаа гарлаа" });
  }
};


exports.updateEmployeeProfile = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware-ээс авна
    const employee = await Employee.findByPk(userId);

    if (!employee) {
      return res.status(404).json({ message: 'Ажилтан олдсонгүй' });
    }

    const {
      name,
      phone,
      department,
      address,
      gender,
      age,
      professional_degree,
    } = req.body;

    employee.name = name || employee.name;
    employee.phone = phone || employee.phone;
    employee.department = department || employee.department;
    employee.address = address || employee.address;
    employee.gender = gender || employee.gender;
    employee.age = age ? parseInt(age) : employee.age;
    employee.professional_degree = professional_degree || employee.professional_degree;

    if (req.file) {
      employee.profile = {
        ...(employee.profile || {}),
        image: req.file.filename,  // зөвхөн filename хадгална
      };
    }

    await employee.save();
    res.status(200).json({ message: 'Амжилттай шинэчлэгдлээ', employee });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
};


exports.getEmployeeGroups = async (req, res) => {
  try {
    const employeeId = req.user.id; // JWT decode болсон ID

    const employeeGroups = await EmployeeGroup.findAll({
      where: { employee_id: employeeId },
      include: [
        {
          model: Group,
          as: 'group',
          required: true,
          attributes: ['id', 'name', 'profile'],
        }
      ]
    });

    const groups = await Promise.all(employeeGroups.map(async (eg) => {
      // Групп бүрийн гишүүдийн тоог авна
      const memberCount = await EmployeeGroup.count({
        where: { group_id: eg.group.id }
      });

      return {
        id: eg.group.id,
        name: eg.group.name,
        image: eg.group.profile?.image || null,
        members: memberCount, // 🧩 гишүүдийн тоог тавина
      };
    }));

    res.json(groups);
  } catch (err) {
    console.error('Алдаа гарлаа:', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
};

exports.getProfileStats = async (req, res) => {
  try {
    const employeeId = req.user.id; // JWT-ээс employee_id олно
    // Зааварчилгаа үзсэн тоо
    const instructionsCount = await InstructionHistory.count({
      where: {
        employee_id: employeeId,
        instruction_status: 'viewed'
      }
    });
    // Сургалтанд оролцсон тоо
    const trainingCount = await TrainingAttendance.count({
      where: {
        employee_id: employeeId,
        attended: true
      }
    });
    res.json({
      instructionsCount,
      trainingCount
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};