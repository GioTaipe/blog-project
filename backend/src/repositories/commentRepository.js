const Comment = require("../models/comments");

// Modificamos create para que sea async y haga el populate antes de retornar
const create = async (data) => {
    const newComment = new Comment(data);
    await newComment.save();
    
    // Poblamos el autor para que el frontend reciba el nombre e imagen de inmediato
    return await newComment.populate("author", "name profileImage");
};

const findById = (commentId) => Comment.findById(commentId);

const findByPostId = (postId) =>
  // Nota: en populate, los campos van separados por espacio en un solo string
  Comment.find({ post: postId }).populate("author", "name profileImage");

const deleteById = (commentId) => Comment.deleteOne({ _id: commentId });

module.exports = {
    create,
    findById,
    findByPostId,
    deleteById,
};