const express = require("express");
const articleControllers = require("../controllers/articleControllers");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Ruta para crear un articulo
router.post("/createArticle",verifyToken, articleControllers.createArticle);
// Ruta para obtener todos los articulos
router.get("/getAllArticles", articleControllers.getAllArticles);
// Ruta para obtener un articulo por su ID
router.get("/my", verifyToken,articleControllers.getUserArticles);
// Ruta para eliminar un articulo por su ID
router.delete("/:id", verifyToken, articleControllers.deleteArticle);
// Ruta para dar like a un articulo
router.post("/:id/like", verifyToken, articleControllers.likeArticle);

module.exports = router;