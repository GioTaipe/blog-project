const mongoose = require("mongoose");

// Variables de entorno imprescindibles para conectar a la base de datos
const REQUIRED_ENV = ["URL_MONGO", "DATABASE_NAME"];

// Función para conectar a MongoDB
const connectDB = async () => {
  // En producción (Railway/Render) el .env NO se sube: las variables se cargan
  // desde el panel del servicio. Si faltan, avisamos claro en vez de fallar
  // con un error opaco de "connect undefined".
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `❌ Faltan variables de entorno: ${missing.join(", ")}. ` +
      `Configúralas en el panel del hosting (Railway) o en backend/.env`
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.URL_MONGO, {
      dbName: process.env.DATABASE_NAME,
      serverSelectionTimeoutMS: 10000, // fallar rápido en vez de colgarse 30s
    });
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    console.error(
      "   Causas típicas: 1) contraseña incorrecta en URL_MONGO; " +
      "2) la IP del servidor no está permitida en Atlas (Network Access → 0.0.0.0/0)."
    );
    process.exit(1);
  }
};

module.exports = connectDB;
