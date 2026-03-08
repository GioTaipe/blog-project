const postRepository = require("../repositories/postRepository");
const { uploadFile, deleteFile } = require("../utils/cloudinary");

const createPost = async (authorId, content, file) => {
  const articleData = { content, authorId };

  if (file) {
    const fileUrl = await uploadFile(file, 'BLOG/IMAGES-POST');
    articleData.fileUrl = fileUrl;
  }

  const article = await postRepository.create(articleData);
  return {
    _id: article._id,
    content: article.content,
    fileUrl: article.fileUrl || null,
    authorId: article.authorId,
    likes: [],
  };
};

const getAllPost = async () => {
  const articles = await postRepository.findAll();
  return articles;
};

const deletePost = async (id, userId) => {
  const article = await postRepository.findById(id);

  if (!article) {
    const error = new Error("Artículo no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const authorId = article.authorId._id ? article.authorId._id.toString() : article.authorId.toString();
  if (authorId !== userId.toString()) {
    const error = new Error("No tienes permiso para eliminar este artículo");
    error.statusCode = 403;
    throw error;
  }

  // Si hay archivo en S3, eliminarlo
  if (article.fileUrl) {
    await deleteFile(article.fileUrl);
  }

  // Eliminar artículo de DB
  await postRepository.deleteOne(id);
};

const toggleLike = async (postId, userId) => {
  const post = await postRepository.findById(postId);
  if (!post) {
    const error = new Error("Post no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const alreadyLiked = post.likes.some((id) => id?.equals(userId));

  const updatedPost = alreadyLiked
    ? await postRepository.pullLike(postId, userId)
    : await postRepository.pushLike(postId, userId);

  return updatedPost;
};

const getPostsByUserId = async (userId) => {
  const articles = await postRepository.findByAuthorId(userId);
  return articles;
};

module.exports = {
  createPost,
  getAllPost,
  deletePost,
  toggleLike,
  getPostsByUserId,
};
