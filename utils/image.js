const fs = require('fs');
const path = require('path');

const saveBase64Image = async (base64Image, folder = 'uploads') => {
  const matches = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) throw new Error('Invalid base64 string');

  const extension = matches[1].split('/')[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const fileName = `${Date.now()}.${extension}`;
  const uploadPath = path.join(__dirname, '..', folder);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const filePath = path.join(uploadPath, fileName);
  fs.writeFileSync(filePath, buffer);

  return `/${folder}/${fileName}`; // Жишээ: /uploads/1712345678901.jpeg
};

module.exports = { saveBase64Image };
