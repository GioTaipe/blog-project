const express = require("express");
const userController = require("../controllers/userControllers");
const verifyToken = require("../middleware/verifyToken");
const validateUser = require("../middleware/validateUsers");

const router = express.Router();

// Ruta para registrar usuarios
router.post("/register", validateUser.validateRegister, userController.createUser);
// Ruta para iniciar sesión
router.post("/login", validateUser.validateLogin, userController.loginUser);
// Ruta para obtener todos los usuarios
router.get("/", userController.getAllUsers);
// Ruta para obtener un usuario por ID
router.get("/me",verifyToken, userController.getAuthenticatedUser);
// Ruta para eliminar un usuario por ID
router.delete("/me",verifyToken ,userController.deleteUser);
// Ruta para actualizar un usuario por ID
router.put("/me", verifyToken,userController.updateUser);

module.exports = router;
