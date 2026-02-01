const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/did_zk_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️  MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️  Running without MongoDB. Some features may be limited.');
    console.warn('   To enable full functionality, start MongoDB or configure MONGODB_URI');
    // Don't exit - allow the server to run without MongoDB for basic testing
  }
};

module.exports = connectDB;
