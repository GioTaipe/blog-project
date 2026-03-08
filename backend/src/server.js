const dotenv = require('dotenv');
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const PORT = 3001;

// Conectar a la base de datos antes de iniciar el servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo`);
  });
});
