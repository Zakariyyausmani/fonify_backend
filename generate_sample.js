const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const data = [
  {
    ruleNumber: 'T-101',
    title: 'Speed Limit Compliance',
    description: 'Drivers must not exceed the posted speed limit in urban areas (typically 40-60 km/h) and highways (80-120 km/h).',
    category: 'Traffic',
    subcategory: 'Speeding',
    fineAmount: 500,
    punishment: 'Fine + Points',
    severity: 'High',
    mediaUrl: 'https://images.unsplash.com/photo-1546422126-409bb7912058?auto=format&fit=crop&q=80'
  },
  {
    ruleNumber: 'T-102',
    title: 'Red Light Violation',
    description: 'Failiure to stop at a red traffic signal is a major safety violation.',
    category: 'Traffic',
    subcategory: 'Signals',
    fineAmount: 1000,
    punishment: 'Fine + License Suspension',
    severity: 'Critical',
    mediaUrl: 'https://images.unsplash.com/photo-1538332466752-6609242060bb?auto=format&fit=crop&q=80'
  },
  {
    ruleNumber: 'S-201',
    title: 'Helmet Mandatory',
    description: 'All motorcyclists and pillion riders must wear a certified safety helmet at all times while moving.',
    category: 'Safety',
    subcategory: 'Personal',
    fineAmount: 200,
    punishment: 'Fine Only',
    severity: 'Medium',
    mediaUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80'
  },
  {
    ruleNumber: 'P-301',
    title: 'Illegal Parking',
    description: 'Parking in "No Parking" zones or blocking emergency exits is prohibited.',
    category: 'Parking',
    subcategory: 'Zones',
    fineAmount: 300,
    punishment: 'Tow + Fine',
    severity: 'Low',
    mediaUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80'
  }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Rules");

const filePath = path.join(__dirname, 'sample_rules.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`Successfully generated ${filePath}`);
