const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables relative to api folder
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/db');

const app = express();

// 1. Connect to MongoDB
connectDB();

// 2. Middlewares
app.use(cors());
app.use(express.json());

// 3. Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    dbState: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`E-Commerce server running on port ${PORT}`));