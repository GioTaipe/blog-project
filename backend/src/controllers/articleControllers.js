const Article = require("../models/articles");
const articleService = require('../services/articleService');
const asyncHandler = require('../utils/asyncHandler')

// Crear un artículo
exports.createArticle = asyncHandler(async (req, res) => {
  const authorId = req.user._id;
  const { content } = req.body;
  const file = req.files?.image;

  const article = await articleService.createArticle(authorId, content, file);

  res.status(201).json({
    message: "Articulo publicado con éxito",
    article
  });
});
// Obtener todos los artículos
exports.getAllArticles = asyncHandler(async (req, res) => {
  const articles = await articleService.getAllArticles();
  res.json({ success: true, articles });
});
// Obtener artículos de un usuario específico
exports.getUserArticles = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const articles = await articleService.getUserArticles(userId);
    res.json({ success: true, articles });

});
// Eliminar un artículo
exports.deleteArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("🔄 Solicitud para eliminar artículo con ID:", id);

  await articleService.deleteArticle(id);

  res.status(200).json({ success: true, message: "Artículo eliminado exitosamente" });
})
// Dar like a un artículo
exports.likeArticle = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user._id;

  const updatedPost = await articleService.toggleLike(postId, userId);

  res.status(200).json(updatedPost);
});

