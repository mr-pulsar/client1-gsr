const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function bootstrapAdmin() {
  const email = 'support@gsr.com';
  const password = '123456789';
  const name = 'GSR Admin';

  try {
    const existing = await User.findOne({ email });
    const hashed = await bcrypt.hash(password, 12);
    if (existing) {
      existing.name = name;
      existing.password = hashed;
      existing.role = 'admin';
      await existing.save();
      console.log('bootstrap: updated admin', email);
    } else {
      await User.create({ name, email, password: hashed, role: 'admin' });
      console.log('bootstrap: created admin', email);
    }
  } catch (err) {
    console.error('bootstrapAdmin error:', err.message || err);
  }
}

module.exports = bootstrapAdmin;
