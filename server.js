// server.js
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');
const cron = require('node-cron');
const uploadRoutes = require('./routes/uploadRoute');
const { SystemAdmin } = require('./models'); 
const authRoutes = require('./routes/authRoutes'); 
const orgAdmin = require('./routes/orgAdmin');
const systemAdmin = require('./routes/systemAdmin');
const organizationRoute = require('./routes/organizationRoutes');
const employeeSafetyRoute = require('./routes/employeeSafetyRoute');
const safetyRoutes = require('./routes/safetyRoutes');
const instructionRoutes = require('./routes/instructionRoutes');
const groupRoutes = require('./routes/groupRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
app.use(express.json()); 
const signatureRoutes = require('./routes/signatures'); // ✍️ Signature route
const issueRoutes = require('./routes/issueRoutes');
const { Server } = require('socket.io');


const http = require('http');



 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Database connection
sequelize.authenticate()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ DB connection error:', err));

// Sync models
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Models synchronized'))
  .catch(err => console.error('❌ DB sync error:', err));

  cron.schedule('0 */2 * * *', async () => {
    try {
      const deletedCount = await SystemAdmin.destroy({
        where: { verified: false }
      });
  
     // console.log(🧹 [CRON JOB] 2 цаг тутамд баталгаажаагүй хэрэглэгч устгав: ${deletedCount} ширхэг);
    } catch (error) {
      console.error('❌ CRON job алдаа:', error);
    }
  });


  // app.use(cors({
  //   origin: '*', // Эсвэл гараар mobile IP-аа whitelist хийж болно
  //   credentials: true
  // }));
  
// app.use(cors({
//   origin: 'http://localhost:3000', // 🌟 Яг client origin-ийг тавина
//   credentials: true // 🌟 Cookie, Authorization header зөвшөөрөх
// }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// --- Socket.IO logic ---
io.on('connection', (socket) => {
  // Client бүр issue-ийн id-р join хийж орно
  socket.on('joinIssue', (issueId) => {
    socket.join(`issue_${issueId}`);
  });

  // Comment нэмэгдсэнд push event
  socket.on('newComment', ({ issueId, comment }) => {
    // Бусад хэрэглэгчдэд broadcast
    io.to(`issue_${issueId}`).emit('receiveComment', comment);
  });
});

app.set('io', io);
// Динамик origin шалгах
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true); // Postman гэх мэт орж ирэхгүй үед зөвшөөрнө
    }

    if (origin.includes('localhost:3000')) {
      callback(null, true); // ✅ Localhost web зөвшөөрнө
    } else {
      callback(null, true); // ✅ Бусад орчныг ч бас зөвшөөрнө (*)
    }
  },
  credentials: true, // Authorization, Cookie дамжуулахыг зөвшөөрнө
};

app.use(cors(corsOptions));



app.use(express.json());


app.listen(5050, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:5050');
});



// Static folder
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/auth', uploadRoutes, authRoutes);
 

//систем админы хийх үйлдлүүд 
app.use('/api/system-admin' , systemAdmin);


app.use('/api/orgadmin', orgAdmin);

app.use('/api/organizations' , organizationRoute );

app.use('/api/users' , employeeSafetyRoute );

app.use('/api' , uploadRoutes);


app.use('/api/group' , groupRoutes);

app.use('/api/safety-engineer', safetyRoutes);


app.use('/api/employee' , employeeRoutes);

app.use('/api/instruction', instructionRoutes);

 app.use('/api', issueRoutes); // 👈 энд заавал холбоно


app.use(express.json({ limit: '10mb' }));  // Base64 зураг явуулах тул payload ихсэх магадлалтай
app.use('/api/signatures', signatureRoutes);
