const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // جرب كده لو مش شغال
    const conn = await mongoose.connect('mongodb+srv://layanobeid30_db_user:rPHOeybWvlFQZLSG@cluster0.ibzl2tk.mongodb.net/taskora');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;