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
const organizationRoute = require('./routes/organizationRoute');
const employeeSafetyRoute = require('./routes/employeeSafetyRoute');
const safetyRoutes = require('./routes/safetyRoutes');



 
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


app.use(cors({
  origin: 'http://localhost:3000',  
  credentials: true
}));

app.use(express.json());

app.listen(5050, () => {
  console.log('Server running on http://localhost:5050');
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


app.use('/api/safety-engineer' , safetyRoutes);






 

