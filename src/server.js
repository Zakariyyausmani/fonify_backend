const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fonify';

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);

  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
      console.error('Database connection error:', err);
      console.log('TIP: Check if your IP is whitelisted in MongoDB Atlas or if your connection string is correct.');
    });
});
