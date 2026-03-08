const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    content: { type: String, required: false },
    fileUrl: { type: String, required: false },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
   },
);

// Definimos el Virtual
PostSchema.virtual('comments', {
  ref: 'Comment',          // El modelo a buscar
  localField: '_id',       // El campo en el modelo Post
  foreignField: 'post'     // El campo en el modelo Comment que tiene el ID del post
});

// Middleware para eliminar comentarios asociados al eliminar un post
PostSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const Comment = mongoose.model("Comment");

    await Comment.deleteMany({ post: this._id });

    next();
  },
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
