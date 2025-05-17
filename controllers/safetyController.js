//safetyController.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {
  SafetyEngineer,
  Employee,
  Group,
  EmployeeGroup,
  SafetyInstruction,
  InstructionPage,
  OrganizationAdmin
} = require("../models"); // SafetyEngineer болон Employee хүснэгтүүдийг импортлоно
const upload = require("../middleware/upload");

exports.login = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;

    let user;
    let role;

    // SafetyEngineer хүснэгтээс шалгах
    user = await SafetyEngineer.findOne({ where: { email } });
    if (user) {
      role = "safety-engineer";
    } else {
      // Хэрэв SafetyEngineer-д байхгүй бол Employee хүснэгтээс шалгана
      user = await Employee.findOne({ where: { email } });
      if (user) {
        role = "employee";
      }
    }

    // Хэрэглэгч олдсонгүй
    if (!user) return res.status(404).json({ message: "Хэрэглэгч олдсонгүй." });

    // Нууц үг шалгах
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Нууц үг буруу байна." });

    // 🔥 Энд алдаагаа засах хэрэгтэй!
    const organization_id = user.organization_id; // 👈 User-с organization_id-г авна

    // JWT үүсгэх
    const token = jwt.sign(
      { id: user.id, role, organization_id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Амжилттай нэвтэрсэн хариу
    res.status(200).json({
      token,
      message: "Нэвтрэх амжилттай.",
      user: {
        id: user.id,
        email: user.email,
        username: user.name,
        role,
        organization_id, // 👈 Хэрэглэгчийн мэдээлэлд байгууллагын ID-г буцаана
      },
    });
  } catch (error) {
    console.error("❌ Login алдаа:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.makeGroup = async (req, res) => {
  try {
    const { name, activity, work_description, work_detail } = req.body;
    const { id: safetyEngineer_id, organization_id } = req.user;

    if (!organization_id) {
      return res
        .status(400)
        .json({ error: "Байгууллагын мэдээлэл олдсонгүй." });
    }

    // JSON хэлбэрээр profile зураг зам хадгалах
    const profile = req.file
      ? { image: `/uploads/${req.file.filename}` }
      : null;

    const group = await Group.create({
      name,
      activity,
      work_description,
      work_detail,
      safetyEngineer_id,
      organization_id,
      profile, // ✅ JSON замыг хадгалж байна
      status: "active",
    });

    return res.status(201).json({ message: "Бүлэг амжилттай үүслээ", group });
  } catch (error) {
    console.error("Бүлэг үүсгэх үед алдаа:", error);
    return res.status(500).json({ error: "Дотоод серверийн алдаа" });
  }
};

exports.getGroups = async (req, res) => {
  try {
    console.log("🔐 Нэвтэрсэн хэрэглэгч:", req.user);

    const groups = await Group.findAll({
      where: { organization_id: req.user.organization_id },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(groups);
  } catch (err) {
    console.error("❌ Бүлэг татах үед алдаа:", err);
    return res
      .status(500)
      .json({ error: "Бүлэг татах үед серверийн алдаа гарлаа" });
  }
};

exports.getGroupMembers = async (req, res) => {
  const { groupId } = req.params;

  try {
    const members = await EmployeeGroup.findAll({
      where: { group_id: groupId },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "name", "email", "profile"],
        },
      ],
    });

    // employee объектуудыг цэвэрхэн харуулах
    const employees = members.map((m) => {
      const profile = m.employee.profile;
      const avatarFile = profile?.avatar || profile?.image || null;

      return {
        id: m.employee.id,
        name: m.employee.name,
        email: m.employee.email,
        avatar: avatarFile ? `/uploads/${avatarFile}` : null,
      };
    });

    res.json(employees);
  } catch (err) {
    console.error("Group members fetch error:", err);
    res.status(500).json({ message: "Гишүүдийг татахад алдаа гарлаа" });
  }
};

// controllers/safetyController.js
const Organization = require("../models/Organization");

exports.getOrganizationInfo = async (req, res) => {
  try {
    const organizationId = req.user.organization_id; // JWT decode хийгдсэн хэрэглэгчийн мэдээллээс

    if (!organizationId) {
      return res.status(400).json({ message: "Байгууллагын ID олдсонгүй" });
    }

    const organization = await Organization.findByPk(organizationId);

    if (!organization) {
      return res.status(404).json({ message: "Байгууллага олдсонгүй" });
    }

    res.json(organization);
  } catch (error) {
    console.error("Organization fetch error:", error);
    res
      .status(500)
      .json({ message: "Байгууллагын мэдээлэл авахад алдаа гарлаа" });
  }
};

exports.getOrganizationEmployees = async (req, res) => {
  try {
    const organizationId = req.user.organization_id;

    if (!organizationId) {
      return res.status(400).json({ message: "Байгууллагын ID олдсонгүй" });
    }

    const employees = await Employee.findAll({
      where: { organization_id: organizationId },
      attributes: ["id", "name", "email", "profile"],
    });

    const result = employees.map((emp) => {
      const avatarFile = emp.profile?.avatar || emp.profile?.image || null;

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        avatar: avatarFile ? `/uploads/${avatarFile}` : null,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Organization members fetch error:", error);
    res
      .status(500)
      .json({ message: "Байгууллагын ажилчдыг татахад алдаа гарлаа" });
  }
};

exports.addGroupMembers = async (req, res) => {
  const { groupId } = req.params;
  const { employeeIds } = req.body;

  try {
    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const records = employeeIds.map((id) => ({
      group_id: groupId,
      employee_id: id,
    }));

    await EmployeeGroup.bulkCreate(records, { ignoreDuplicates: true });

    res.json({ message: "Members added successfully" });
  } catch (err) {
    console.error("Group member add error:", err);
    res.status(500).json({ message: "Error adding members" });
  }
};

exports.getCurrentSafetyEngineerProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId; // JWT middleware-аар орж ирсэн хэрэглэгчийн ID
    if (!userId) {
      return res.status(401).json({ message: "Нэвтэрсэн хэрэглэгч олдсонгүй" });
    }

    const safetyEngineer = await SafetyEngineer.findOne({
      where: { id: userId },
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "gender",
        "age",
        "address",
        "department",
        "professional_degree",
        "assigned_at",
        "profile",
        "organization_id",
        "organization_admin_id",
      ],
      include: [
        { association: "organization", attributes: ["id", "name"] },
        { association: "organizationAdmin", attributes: ["id", "user_name"] },
      ],
    });

    if (!safetyEngineer) {
      return res.status(404).json({ message: "Инженер олдсонгүй" });
    }

    const profile = safetyEngineer.profile || {};
    const avatarFile = profile.avatar || profile.image || null;

    res.json({
      id: safetyEngineer.id,
      name: safetyEngineer.name,
      email: safetyEngineer.email,
      phone: safetyEngineer.phone,
      gender: safetyEngineer.gender,
      age: safetyEngineer.age,
      address: safetyEngineer.address,
      department: safetyEngineer.department,
      professional_degree: safetyEngineer.professional_degree,
      assigned_at: safetyEngineer.assigned_at,
      organization: safetyEngineer.organization,
      organizationAdmin: safetyEngineer.organizationAdmin,
      avatar: avatarFile ? `/uploads/${avatarFile}` : null,
    });
  } catch (err) {
    console.error("Safety engineer profile fetch error:", err);
    res.status(500).json({ message: "Мэдээлэл татах үед алдаа гарлаа" });
  }
};

//profile засах
exports.updateCurrentSafetyEngineerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    if (req.file) {
      updates.profile = {
        image: `${req.file.filename}`, // DB-д хадгалах path
      };
    }

    await SafetyEngineer.update(updates, {
      where: { id: userId },
    });

    res.json({ message: "Амжилттай шинэчлэгдлээ" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Шинэчлэхэд алдаа гарлаа" });
  }
};

exports.createSafetyInstruction = async (req, res) => {
  try {
    const { title, number, description, start_date, end_date } = req.body;
   

    if (!title || !number || !description || !start_date || !end_date) {
      return res.status(400).json({ error: "Бүх талбарыг бөглөнө үү." });
    }

    const instruction = await SafetyInstruction.create({
      title,
      number,
      description,
      start_date,
      end_date,
      safetyEngineer_id: req.user.id,
    });

    res.status(201).json(instruction);
  } catch (error) {
    console.error("❌ Зааварчилгаа үүсгэх үед алдаа:", error);
    res.status(500).json({ error: "Серверийн алдаа" });
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
      const relativePath = `${file.destination.split("/").pop()}/${
        file.filename
      }`;

      if (mime.startsWith("image/")) image_url = relativePath;
      else if (mime.startsWith("audio/")) audio_url = relativePath;
      else if (mime.startsWith("video/")) video_url = relativePath;
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
    console.error(err);
    res
      .status(500)
      .json({ message: "Алдаа: Хуудас хадгалах үед алдаа гарлаа" });
  }
};
 

// controllers/safetyController.js
exports.getAllInstructions = async (req, res) => {
  try {
    const instructions = await SafetyInstruction.findAll({
      where: { safetyEngineer_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.status(200).json(instructions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Алдаа: Зааварчилгаа татах үед алдаа гарлаа' });
  }
};


exports.getSafetyEngineerById = async (req, res) => {
  try {
    const id = req.params.id;

    const engineer = await SafetyEngineer.findByPk(id, {
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name'],
        },
        {
          model: OrganizationAdmin,
          as: 'organizationAdmin',
          attributes: ['id', 'user_name', 'email'],
        },
      ],
    });

    if (!engineer) {
      return res.status(404).json({ message: 'ХАБ инженер олдсонгүй' });
    }

    res.status(200).json(engineer);
  } catch (error) {
    console.error('⚠️ ХАБ инженер fetch алдаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
};

