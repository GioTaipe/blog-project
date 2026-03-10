const postService = require("../services/postService");
const asyncHandler = require("../utils/asyncHandler");

const createPost = asyncHandler(async (req, res) => {
  const authorId = req.user._id;
  const { content } = req.body;
  const file = req.files?.image;

  const post = await postService.createPost(authorId, content, file);

  res.status(201).json({
    message: "Articulo publicado con éxito",
    post,
  });
});

const getAllPost = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const { posts, hasMore } = await postService.getAllPost(page);
  res.json({ success: true, posts, hasMore });
});

const getUserPost = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const posts = await postService.getPostsByUserId(userId);

  res.json({ success: true, posts });
});

const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  await postService.deletePost(id, userId);

  res
    .status(200)
    .json({ success: true, message: "Artículo eliminado exitosamente" });
});

const likePost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user._id;

  const updatedPost = await postService.toggleLike(postId, userId);

  res.status(200).json(updatedPost);
});

const getPostsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const posts = await postService.getPostsByUserId(userId);

  res.json({ success: true, posts });
});

module.exports = {
  createPost,
  getAllPost,
  getUserPost,
  deletePost,
  likePost,
  getPostsByUser,
};
