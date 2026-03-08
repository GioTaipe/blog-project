const mongoose = require("mongoose");

// Función para conectar a MongoDB
const connectDB = async () => {
  try {
      
    await mongoose.connect(process.env.URL_MONGO, {
      dbName: process.env.DATABASE_NAME, 
    });
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
