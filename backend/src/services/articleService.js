// services/articleService.js
const articleRepository = require('../repositories/articleRepository');
const { uploadFile, deleteFile } = require('./s3'); 

const createArticle = async (authorId, content, file) => {
  const articleData = { content, authorId };

  if (file) {
    const fileUrl = await uploadFile(file);
    articleData.fileUrl = fileUrl;
  }

  const article = await articleRepository.create(articleData);
  return {
    _id: article._id,
    content: article.content,
    fileUrl: article.fileUrl || null,
    authorId: article.authorId,
    likes: []
  };
};

const getAllArticles = async () => {
  const articles = await articleRepository.findAll();
  return articles;
};


const getUserArticles = async (authorId) => {
  
  const articles = await articleRepository.findByAuthorId(authorId);
  return articles;
};

const deleteArticle = async (id) => {
  const article = await articleRepository.findById(id);

  if (!article) {
    const error = new Error("Artículo no encontrado");
    error.statusCode = 404;
    throw error;
  }

  // Si hay archivo en S3, eliminarlo
  if (article.fileUrl) {
    const fileName = article.fileUrl.split("/").pop();
    await deleteFile(fileName);
  }

  // Eliminar artículo de DB
  await articleRepository.deleteOne(id);
};

const toggleLike = async (postId, userId) => {
  const post = await articleRepository.findById(postId);
  if (!post) {
    const error = new Error("Post no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const alreadyLiked = post.likes.some(id => id?.equals(userId));

  const updatedPost = alreadyLiked
    ? await articleRepository.pullLike(postId, userId)
    : await articleRepository.pushLike(postId, userId);

  return updatedPost;
};

module.exports = {
  createArticle,
  getAllArticles,
  getUserArticles,
  deleteArticle,
  toggleLike
};
