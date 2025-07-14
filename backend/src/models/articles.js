const mongoose = require("mongoose");
require('./comments');

    const ArticleSchema = new mongoose.Schema(
        {
            content: { type: String, required: false },
            fileUrl: { type: String, required: false },
            authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
        },
        { timestamps: true }
    );
console.log("✅ Modelo de artículo cargado correctamente");

ArticleSchema.pre('deleteOne',{ document: true, query: false }, async function (next) {
    console.log("✅ Middleware pre('deleteOne') ejecutado para artículo:", this._id);
    const Comment = mongoose.model("Comment");
    // Elimina los comentarios asociados
    await Comment.deleteMany({ article: this._id });

    next();
});


const Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;
