const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/verification', require('./routes/verificationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Fonify API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('--- Global Error Handler ---');
    console.error(err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

module.exports = app;
