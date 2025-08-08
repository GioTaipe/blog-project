const commentRepository = require("../repositories/commentRepository");

const createComment = async ({ content, articleId, userId }) => {
  const commentData = {
    content,
    article: articleId,
    author: userId,
  };
  return await commentRepository.create(commentData);
};

const getCommentsByArticleId = async (articleId) => {
  const comments = await commentRepository.findByArticleId(articleId);

  if (!comments || comments.length === 0) {
    const error = new Error("No se encontraron comentarios para este artículo");
    error.statusCode = 404;
    throw error;
  }

  return comments;
};

const deleteComment = async (commentId) => {
  const deleted = await commentRepository.deleteById(commentId);

  if (!deleted) {
    const error = new Error("Comentario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return true;
};

module.exports = {
  createComment,
  getCommentsByArticleId,
  deleteComment,
};
