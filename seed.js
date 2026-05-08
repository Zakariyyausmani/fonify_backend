const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Rule = require('./src/models/Rule');
const User = require('./src/models/User'); // Optional: Seed an admin user

dotenv.config();

const rules = [
  {
    ruleNumber: "119",
    title: "Disobeying Traffic Signs",
    description: "Failure to obey traffic signs, signals, or police directions.",
    category: "Traffic",
    fineAmount: 500,
    punishment: "None",
    severity: "Medium",
    status: "active"
  },
  {
    ruleNumber: "129",
    title: "Wearing Helmet",
    description: "Driving a two-wheeler without a helmet (both rider and pillion).",
    category: "Safety",
    fineAmount: 1000,
    punishment: "License Disqualification (3 months)",
    severity: "High",
    status: "active"
  },
  {
    ruleNumber: "185",
    title: "Drunk Driving",
    description: "Driving by a drunken person or under the influence of drugs.",
    category: "Criminal",
    fineAmount: 10000,
    punishment: "Imprisonment up to 6 months",
    severity: "Critical",
    status: "active"
  },
  {
    ruleNumber: "184",
    title: "Dangerous Driving",
    description: "Driving dangerously (speeding, racing, using phone).",
    category: "Traffic",
    fineAmount: 5000,
    punishment: "Seizure of License",
    severity: "High",
    status: "active"
  }
];

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI missing");

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Clear existing rules to avoid duplicates
    await Rule.deleteMany();
    console.log('🗑️  Cleared existing rules');

    // Insert new rules
    await Rule.insertMany(rules);
    console.log('🌱 Seeded 4 Rules successfully');

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
