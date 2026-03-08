const express = require("express");
const commentControllers = require("../controllers/commentControllers");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();
// Ruta para crear un comentario en un artículo
router.post('/createComment/:id',verifyToken, commentControllers.createComment);
// Ruta para elimina un comentario
router.delete('/:id',verifyToken, commentControllers.deleteComment);

module.exports = router;