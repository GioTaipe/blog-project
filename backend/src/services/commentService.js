const commentRepository = require("../repositories/commentRepository");

const createComment = async ({ content, postId, userId }) => {
  const commentData = {
    content,
    post: postId,
    author: userId,
  };
  return await commentRepository.create(commentData);
};

const getCommentsByPostId = async (postId) => {
  const comments = await commentRepository.findByPostId(postId);

  return comments;
};

const deleteComment = async (commentId, userId) => {
  const comment = await commentRepository.findById(commentId);

  if (!comment) {
    const error = new Error("Comentario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (comment.author.toString() !== userId.toString()) {
    const error = new Error("No tienes permiso para eliminar este comentario");
    error.statusCode = 403;
    throw error;
  }

  const deleted = await commentRepository.deleteById(commentId);

  return true;
};

module.exports = {
  createComment,
  getCommentsByPostId,
  deleteComment,
};
