const Comment = require("../models/comments");

// Crear un nuevo comentario
exports.createComment = async (req , res) => {
    try{
        const { id: article } = req.params;
        console.log("article: ", article);
        const author = req.user._id;
        console.log("author: ", author);
        
        const { content } = req.body;
        const comment = new Comment( {content, author, article} );
        console.log("comment: ", comment);
        
        await comment.save();

    res.status(201).json({
      message: "Comentario publicado con éxito",
      comment: { _id: comment._id, content: comment.content, author: comment.author, article: comment.article },
    });

    } catch ( error ) {
        res.status(500).json({ message: "Error del servidor", error });
    }
}
// Obtener comentarios de un artículo
exports.getComments = async (req, res) => {
    try {
        const { id: articleId } = req.params; 
        console.log("Fetching comments for articleId:", articleId);
        
        console.log("articleId: ", articleId);
        
        const comments = await Comment.find({ article: articleId }).populate('author', 'name profileImage'); 
        
        if ( !comments || comments.length === 0 ) {
            return res.status(404).json({ message: "No se encontraron comentarios para este artículo" });
        }

        res.status(200).json(comments);

    } catch ( error ) {
        res.status(500).json({ message: "Error del servidor", error });
    }   
}
// Eliminar un comentario
exports.deleteComment = async (req, res) => {
    try {
        const { id: articleId, id: commentId } = req.params;
        
        const comment = await Comment.findOneAndDelete({ _id: commentId});

        if ( !comment ) {
            return res.status(404).json({ message: "Comentario no encontrado" });
        }

        res.status(200).json({ message: "Comentario eliminado con éxito" });

    } catch ( error ) {
        res.status(500).json({ message: "Error del servidor", error });
    }
}