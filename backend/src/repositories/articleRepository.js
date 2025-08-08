// repositories/articleRepository.js
const Article = require('../models/articles');

const create = (data) => new Article(data).save();
const findById = (id) => Article.findById(id);
const findAll = () => Article.find().populate('authorId', 'name profileImage').sort({ createdAt: -1 });
const findByAuthorId = (userId) =>Article.find({ authorId: userId }).sort({ createdAt: -1 });
const deleteOne = async (id) => {
  const post = await Article.findById(id);
  if (!post) return null;
  return await post.deleteOne(); // ✅ ejecuta el middleware
};
const save = (article) => article.save();

const pushLike = (postId, userId) =>
  Article.findByIdAndUpdate(
    postId,
    { $addToSet: { likes: userId } },
    { new: true }
  );

const pullLike = (postId, userId) =>
  Article.findByIdAndUpdate(
    postId,
    { $pull: { likes: userId } },
    { new: true }
  );

module.exports = {
  create,
  findById,
  findAll,
  deleteOne,
  findByAuthorId,
  save,
  pushLike,
  pullLike
};
