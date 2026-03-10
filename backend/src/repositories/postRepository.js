// repositories/articleRepository.js
const Posts = require("../models/post");

const create = (data) => new Posts(data).save();

const countByAuthor = (userId) => Posts.countDocuments({ authorId: userId });

const findAll = (skip = 0, limit = 0) => {
  const query = Posts.find()
    .populate("authorId", "name profileImage")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "name profileImage"
      }
    })
    .sort({ createdAt: -1 });

  if (limit > 0) {
    query.skip(skip).limit(limit);
  }

  return query;
};

const findById = (id) => 
  Posts.findById(id)
    .populate("authorId", "name profileImage")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "name profileImage"
      }
    });

const findByAuthorId = (userId) =>
  Posts.find({ authorId: userId })
    .populate("authorId", "name profileImage") 
    .populate({
      path: "comments",
      populate: { path: "author", select: "name profileImage" }
    })
    .sort({ createdAt: -1 });

const deleteOne = async (id) => {
  const post = await Posts.findById(id);
  if (!post) return null;
  return await post.deleteOne(); 
};

const save = (post) => post.save();

const pushLike = (postId, userId) =>
  Posts.findByIdAndUpdate(
    postId,
    { $addToSet: { likes: userId } },
    { new: true },
  );

const pullLike = (postId, userId) =>
  Posts.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true });

module.exports = {
  create,
  countByAuthor,
  findAll,
  findById,
  deleteOne,
  findByAuthorId,
  save,
  pushLike,
  pullLike,
};
