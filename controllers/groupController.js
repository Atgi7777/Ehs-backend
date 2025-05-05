const { Employee, Group, EmployeeGroup } = require('../models');

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
  