const asyncHandler = require("../utils/asyncHandler");
const commentService = require("../services/commentService");

const createComment = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;
  const { content } = req.body;
  
  const comment = await commentService.createComment({ content, postId, userId });

  res.status(201).json({
    message: "Comentario publicado con éxito",
    comment,
  });
});

const getComments = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const comments = await commentService.getCommentsByPostId(postId);

  res.status(200).json(comments);
});

const deleteComment = asyncHandler(async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user._id;

  await commentService.deleteComment(commentId, userId);

  res.status(200).json({ message: "Comentario eliminado con éxito" });
});

module.exports = {
  createComment,
  getComments,
  deleteComment,
};
