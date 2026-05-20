#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const User = require(path.join(__dirname, '..', 'src', 'models', 'User'));

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  args.forEach((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  });
  return out;
}

async function main() {
  const { email = 'support@gsr.com', password = '123456789', name = 'GSR Admin' } = parseArgs();

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in environment. Copy .env.example to .env and set MONGO_URI.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const existing = await User.findOne({ email: email.toLowerCase() });
  const hashed = await bcrypt.hash(password, 12);
  if (existing) {
    existing.name = name;
    existing.password = hashed;
    existing.role = 'admin';
    await existing.save();
    console.log('Updated existing admin user:', email);
  } else {
    await User.create({ name, email, password: hashed, role: 'admin' });
    console.log('Created admin user:', email);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
