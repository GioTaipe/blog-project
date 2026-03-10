const dotenv = require('dotenv');
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

// Conectar a la base de datos antes de iniciar el servidor
connectDB().then(() => {
  app.listen(process.env.PORT || 3001, () => {
    console.log(`🚀 Servidor corriendo`);
  });
});
