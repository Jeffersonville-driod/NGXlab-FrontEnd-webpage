// api/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', store: 'Tradia E-Commerce API Active' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`E-Commerce server running on port ${PORT}`));