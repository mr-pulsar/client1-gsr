const mongoose = require('mongoose');

module.exports = async function connectDb() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined');
  }

  return mongoose.connect(uri);
};