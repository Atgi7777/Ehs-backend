const { Employee, Group, EmployeeGroup , SafetyEngineer , Organization , SafetyInstruction , GroupInstruction} = require('../models');


const path = require('path');
const fs = require('fs');
const upload = require("../middleware/upload");


exports.addEmployeeByPhone = async (req, res) => {
  const { groupId } = req.params;
  const { phone } = req.body;

  try {
    // 1. Ажилтан утсаар хайх
    const employee = await Employee.findOne({ where: { phone } });
    if (!employee) {
      return res.status(404).json({ message: 'Утасны дугаараар ажилтан олдсонгүй' });
    }

    // 2. Group байгаа эсэхийг шалгах (сайн туршилтын хувьд)
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Бүлэг олдсонгүй' });
    }

    // 3. Аль хэдийн бүлэгт багтсан эсэх
    const alreadyAdded = await EmployeeGroup.findOne({
      where: { employee_id: employee.id, group_id: groupId },
    });

    if (alreadyAdded) {
      return res.status(400).json({ message: 'Ажилтан аль хэдийн энэ бүлэгт нэмэгдсэн байна' });
    }

    // 4. Нэмэх
    await EmployeeGroup.create({
      employee_id: employee.id,
      group_id: groupId,
    });

    return res.status(200).json({ message: 'Ажилтан бүлэгт амжилттай нэмэгдлээ' });
  } catch (err) {
    console.error('❌ Server Error:', err);
    return res.status(500).json({ message: 'Серверийн алдаа' });
  }
};


exports.addEmployeeByEmail = async (req, res) => {
    const { groupId } = req.params;
    const { email } = req.body;
  
    try {
      // 1. Ажилтан и-мэйлээр хайх
      const employee = await Employee.findOne({ where: { email } });
      if (!employee) {
        return res.status(404).json({ message: 'Имэйлтэй ажилтан олдсонгүй' });
      }
  
      // 2. Бүлэг байгаа эсэхийг шалгах
      const group = await Group.findByPk(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Бүлэг олдсонгүй' });
      }
  
      // 3. Аль хэдийн бүлэгт багтсан эсэхийг шалгах
      const alreadyAdded = await EmployeeGroup.findOne({
        where: { employee_id: employee.id, group_id: groupId },
      });
  
      if (alreadyAdded) {
        return res.status(400).json({ message: 'Ажилтан аль хэдийн энэ бүлэгт нэмэгдсэн байна' });
      }
  
      // 4. Нэмэх
      await EmployeeGroup.create({
        employee_id: employee.id,
        group_id: groupId,
      });
  
      return res.status(200).json({ message: 'Ажилтан бүлэгт амжилттай нэмэгдлээ' });
    } catch (err) {
      console.error('❌ Server Error (email):', err);
      return res.status(500).json({ message: 'Серверийн алдаа' });
    }
  };

  // Express controller жишээ
exports.getEmployeeById = async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await Employee.findByPk(id);
  
      if (!employee) {
        return res.status(404).json({ message: 'Ажилтан олдсонгүй' });
      }
  
      return res.json(employee);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Серверийн алдаа' });
    }
  };


  exports.removeEmployeeFromGroup = async (req, res) => {
    const { groupId, employeeId } = req.params;
  
    try {
      const relation = await EmployeeGroup.findOne({
        where: { group_id: groupId, employee_id: employeeId },
      });
  
      if (!relation) {
        return res.status(404).json({ message: 'Харгалзах бүртгэл олдсонгүй' });
      }
  
      await relation.destroy();
      return res.status(200).json({ message: 'Ажилтан бүлгээс амжилттай хасагдлаа' });
    } catch (error) {
      console.error('❌ Бүлгээс хасах алдаа:', error);
      return res.status(500).json({ message: 'Серверийн алдаа' });
    }
  };
  
  exports.getGroupById = async (req, res) => {
    const groupId = req.params.id;
  
    try {
      const group = await Group.findByPk(groupId, {
        include: [
          { model: SafetyEngineer, as: 'safetyEngineer', attributes: ['id', 'name'] },
          { model: Organization, as: 'organization', attributes: ['id', 'name'] },
        ],
      });
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      res.status(200).json(group);
    } catch (error) {
      console.error('Группийн дэлгэрэнгүй авах үед алдаа:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  



 
  
  exports.updateGroup = async (req, res) => {
    const { groupId } = req.params;
    const { name, activity, work_description, work_detail, status } = req.body;
  
    try {
      const group = await Group.findByPk(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Бүлэг олдсонгүй' });
      }
  
      // Update regular fields
      group.name = name;
      group.activity = activity;
      group.work_description = work_description;
      group.work_detail = work_detail;
      group.status = status;
  
      // ✅ Хэрвээ зураг ирсэн бол profile.image талбарыг update хийнэ
      if (req.file) {
        const newImagePath = `/uploads/${req.file.filename}`;
  
        // Хуучин зураг байвал устгах (хэрвээ хэрэгтэй бол)
        if (group.profile?.image) {
          const oldImagePath = path.join(__dirname, '..', 'public', group.profile.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
  
        // Update profile.image
        group.profile = {
          ...group.profile,
          image: newImagePath,
        };
      }
  
      await group.save();
  
      return res.json({ message: 'Амжилттай шинэчлэгдлээ', data: group });
    } catch (err) {
      console.error('❌ Бүлэг шинэчлэхэд алдаа:', err);
      return res.status(500).json({ message: 'Дотоод алдаа гарлаа' });
    }
  };

  exports.deleteGroup = async (req, res) => {
    const { groupId } = req.params;
  
    try {
      const group = await Group.findByPk(groupId);
  
      if (!group) {
        return res.status(404).json({ message: 'Бүлэг олдсонгүй' });
      }
  
      // Хэрвээ зурагтай бол устгана
      if (group.profile?.image) {
        const imagePath = path.join(__dirname, '..', 'public', group.profile.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
  
      await group.destroy();
  
      return res.json({ message: 'Бүлэг амжилттай устлаа' });
    } catch (err) {
      console.error('❌ Бүлэг устгахад алдаа:', err);
      return res.status(500).json({ message: 'Дотоод серверийн алдаа' });
    }
  };
  

exports.getInstructionsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const groupInstructions = await GroupInstruction.findAll({
      where: { group_id: groupId },
      include: [
        {
          model: SafetyInstruction,
          as: 'safetyInstruction',
        }
      ],
      order: [['assigned_at', 'DESC']],
    });

    // Зөвхөн зааварчилгаануудыг салгаж авах
    const instructions = groupInstructions.map((gi) => gi.safetyInstruction);

    res.status(200).json(instructions);
  } catch (error) {
    console.error('Бүлгийн зааварчилгаа татахад алдаа:', error);
    res.status(500).json({ message: 'Алдаа гарлаа.' });
  }
};
