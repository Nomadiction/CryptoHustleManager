const dotenv = require('dotenv');
const express = require('express');
const path = require('path');

dotenv.config();

const app = express();

// Статистические файлы
app.use('/assets/icons', express.static(path.join(__dirname, 'assets/icons')));

// API маршруты
const apiRoutes = require('./routes/cryptoRoutes');

app.use('/api/crypto', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} — http://localhost:${PORT}/api/crypto/prices`);
});
