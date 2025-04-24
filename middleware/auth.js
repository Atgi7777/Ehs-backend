const jwt = require('jsonwebtoken');

// middleware/auth.js
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];  // Authorization header-аас токен авах
  const token = authHeader && authHeader.split(' ')[1];  // "Bearer <token>" → зөвхөн токен авах

  if (!token) { 
    return res.status(401).json({ message: 'Token required' });  // Токен байхгүй бол 401
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });  // Токен буруу эсвэл хугацаа дууссан бол
    }
    req.user = user;  // Токен шалгагдсан хэрэглэгчийн мэдээлэл
    console.log('✅ JWT decode хийгдсэн хэрэглэгч:', user); 
    next();  
  });
};




module.exports = authenticateToken;




// const authorizeSystemAdmin = (req, res, next) => {
//   if (req.user.role !== 'system_admin') {  // JWT token-оос авсан роль системийн админ байх ёстой
//     return res.status(403).json({ message: 'Зөвхөн системийн админ зөвшөөрөлтэй.' });
//   }
//   next();  // Хэрвээ системийн админ бол дараагийн үйлдлийг гүйцэтгэх
// };





