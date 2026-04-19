const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load Config
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const ruleRoutes = require('./src/routes/ruleRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const userRoutes = require('./src/routes/userRoutes');
const chatRoutes = require('./src/routes/chatRoutes');


// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);


// Root Route
app.get('/', (req, res) => {
    res.json({
        message: 'RuleBook API is running!',
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

// Export app for Vercel
module.exports = app;

// DB Connection & Server Start
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    
    const startServer = async () => {
        try {
            const uri = process.env.MONGO_URI;
            if (uri) {
                await mongoose.connect(uri);
                console.log('✅ MongoDB Connected');
            }
        } catch (error) {
            console.error('❌ Database Connection Error:', error.message);
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    };

    startServer();
} else {
    // On Vercel, we still need to initiate DB connection
    const connectDB = async () => {
        try {
            if (mongoose.connection.readyState === 0) {
                await mongoose.connect(process.env.MONGO_URI);
                console.log('✅ (Vercel) MongoDB Connected');
            }
        } catch (error) {
            console.error('❌ (Vercel) Database Connection Error:', error.message);
        }
    };
    connectDB();
}
