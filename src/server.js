const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes/v1'));

// Welcome Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Fonify API' });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('--- Global Error Handler ---');
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Server Configuration
const PORT = process.env.PORT || 5000;

const http = require('http');
const server = http.createServer(app);
const socketManager = require('./services/socketManager');

// Initialize Socket.io
socketManager.init(server);

// Listen for requests
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = { app, server };
