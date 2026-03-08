const express = require("express");
const postControllers = require("../controllers/postControllers");
const verifyToken = require("../middleware/verifyToken");
const { validatePost } = require("../middleware/validatePost");

const router = express.Router();

// Ruta para crear un articulo
router.post("/createPost", verifyToken, validatePost, postControllers.createPost);
// Ruta para obtener todos los articulos
router.get("/getAllPost", postControllers.getAllPost);
// Ruta para obtener un articulo por su ID
router.get("/my", verifyToken, postControllers.getUserPost);
// Ruta para obtener posts de un usuario específico
router.get("/user/:userId", postControllers.getPostsByUser);
// Ruta para eliminar un articulo por su ID
router.delete("/:id", verifyToken, postControllers.deletePost);
// Ruta para dar like a un articulo
router.post("/:id/like", verifyToken, postControllers.likePost);

module.exports = router;
