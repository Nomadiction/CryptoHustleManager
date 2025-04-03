const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());

// Обслуживание статических файлов
app.use('/assets/icons', express.static(path.join(__dirname, 'assets/icons')));

// API маршруты
const apiRoutes = require('./routes/cryptoRoutes');
app.use('/api/crypto', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} — http://192.168.8.56:${PORT}/api/crypto/prices`);
});
