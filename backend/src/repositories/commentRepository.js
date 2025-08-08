const Comment = require("../models/comments");

const create = (data) => new Comment(data).save();
const findByArticleId = (articleId) =>
  Comment.find({ article: articleId }).populate("author", "name profileImage");
const deleteById = (commentId) => Comment.deleteOne({ _id: commentId });

module.exports = {
  create,
  findByArticleId,
  deleteById,
};
