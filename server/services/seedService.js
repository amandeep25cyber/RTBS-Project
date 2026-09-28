require('dotenv').config(); // load server/.env (Atlas URI for local dev)
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Category = require('../models/Category');

const CATEGORIES = [
  { _id: 'sports',   name: 'Sports',    parentId: null },
  { _id: 'cricket',  name: 'Cricket',   parentId: 'sports' },
  { _id: 'football', name: 'Football',  parentId: 'sports' },
  { _id: 'news',     name: 'News',      parentId: null },
  { _id: 'politics', name: 'Politics',  parentId: 'news' },
];

// Seed users — admin is NEVER created via signup (only here)
// Passwords are hashed. Never commit plain passwords.
const SEED_USERS = [
  {
    name: 'Admin User',
    email: 'admin@platform.com',
    plainPassword: 'admin123',
    role: 'admin',
    status: 'active',
  },
  {
    name: 'Priya Sharma',
    email: 'priya@nikeindia.com',
    plainPassword: 'pass123',
    role: 'advertiser',
    status: 'active',
    companyName: 'Nike India',
    industry: 'e-commerce',
    walletBalance: 5000000, // ₹50,000 in paise
  },
  {
    name: 'Rahul Mehta',
    email: 'rahul@indianexpress.com',
    plainPassword: 'pass123',
    role: 'publisher',
    status: 'active',
    websiteName: 'Indian Express',
    websiteUrl: 'indianexpress.com',
    earningsBalance: 124000, // ₹1,240 in paise
  },
];

async function seed() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rtb';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for seeding');

  // --- Seed Categories ---
  for (const cat of CATEGORIES) {
    await Category.findByIdAndUpdate(
      cat._id,
      { name: cat.name, parentId: cat.parentId },
      { upsert: true, returnDocument: 'after' }
    );
  }
  console.log(`Seeded ${CATEGORIES.length} categories`);

  // --- Seed Users ---
  for (const u of SEED_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`User ${u.email} already exists — skipping`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.plainPassword, 12);
    const { plainPassword, ...fields } = u;
    await User.create({ ...fields, passwordHash });
    console.log(`Seeded user: ${u.email} (${u.role})`);
  }

  await mongoose.disconnect();
  console.log('Seeding complete');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
