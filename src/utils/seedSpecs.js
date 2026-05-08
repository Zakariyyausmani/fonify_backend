const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PhoneModel = require('../models/PhoneModel');

dotenv.config();

const models = [
  {
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    specs: {
      storage: ['256GB', '512GB', '1TB'],
      ram: ['8GB'],
      battery: '4441 mAh',
      screenSize: '6.7 inches',
      colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium']
    },
    popularity: 100
  },
  {
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    specs: {
      storage: ['128GB', '256GB', '512GB', '1TB'],
      ram: ['8GB'],
      battery: '3274 mAh',
      screenSize: '6.1 inches',
      colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium']
    },
    popularity: 90
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    specs: {
      storage: ['256GB', '512GB', '1TB'],
      ram: ['12GB'],
      battery: '5000 mAh',
      screenSize: '6.8 inches',
      colors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet', 'Titanium Yellow']
    },
    popularity: 95
  },
  {
    brand: 'Google',
    model: 'Pixel 8 Pro',
    specs: {
      storage: ['128GB', '256GB', '512GB', '1TB'],
      ram: ['12GB'],
      battery: '5050 mAh',
      screenSize: '6.7 inches',
      colors: ['Obsidian', 'Porcelain', 'Bay']
    },
    popularity: 80
  }
];

const seedDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined in .env');
    await mongoose.connect(uri);
    console.log('Connected to DB...');
    
    await PhoneModel.deleteMany();
    console.log('Cleared existing models...');
    
    await PhoneModel.insertMany(models);
    console.log('Seeded phone models successfully!');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
