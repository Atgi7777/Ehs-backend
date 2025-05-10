//middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// storage тохиргоо
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads'; // default зураг

    if (file.mimetype.startsWith('audio/')) folder = 'uploads/audios';
    else if (file.mimetype.startsWith('video/')) folder = 'uploads/videos';

    // Хэрвээ аудио эсвэл видео байвал фолдер үүсгэх
    if (folder !== 'uploads') {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// зөвшөөрөгдсөн төрөл
const fileFilter = (req, file, cb) => {
const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'audio/mpeg',     // MP3
  'audio/wav',
  'audio/x-wav',
  'video/mp4',
  'video/webm',
  'video/quicktime', // for .mov files
  'video/x-matroska', // for .mkv files
];



  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Зөвхөн зураг, дуу, эсвэл бичлэг upload хийж болно'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
