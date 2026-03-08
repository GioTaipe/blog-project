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
// Ruta para buscar usuarios por nombre
router.get("/search", userController.searchUsers);
// Ruta para obtener un usuario autenticado (debe estar antes de /:id)
router.get("/me",verifyToken, userController.getAuthenticatedUser);
// Ruta para eliminar un usuario por ID
router.delete("/me",verifyToken ,userController.deleteUser);
// Ruta para actualizar un usuario por ID
router.put("/me", verifyToken,userController.updateUser);
// Ruta para actualizar la imagen de perfil
router.put("/me/profile-image", verifyToken, userController.updateProfileImage);
// Ruta para actualizar el banner (color o imagen)
router.put("/me/banner-image", verifyToken, userController.updateBanner);
// Ruta para obtener perfil público de un usuario por ID (debe estar al final)
router.get("/:id", userController.getPublicProfile);

module.exports = router;
