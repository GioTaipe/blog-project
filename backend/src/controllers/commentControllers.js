const asyncHandler = require("../utils/asyncHandler");
const commentService = require("../services/commentService");

// Crear un nuevo comentario
exports.createComment = asyncHandler(async (req, res) => {
  const articleId = req.params.id;
  const userId = req.user._id;
  const { content } = req.body;

  const comment = await commentService.createComment({ content, articleId, userId });

  res.status(201).json({
    message: "Comentario publicado con éxito",
    comment,
  });
});
// Obtener comentarios por ID de artículo
exports.getComments = asyncHandler(async (req, res) => {
  const articleId = req.params.id;
  const comments = await commentService.getCommentsByArticleId(articleId);

  res.status(200).json(comments);
});
// Eliminar comentario
exports.deleteComment = asyncHandler(async (req, res) => {
  const commentId = req.params.id;

  await commentService.deleteComment(commentId);

  res.status(200).json({ message: "Comentario eliminado con éxito" });
});
