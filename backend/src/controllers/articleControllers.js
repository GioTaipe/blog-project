const Article = require("../models/articles");
const { uploadFile, deleteFile } = require("../services/s3");

// Crear un nuevo artículo
exports.createArticle = async (req, res) => {
  try {
    const authorId = req.user._id;
    console.log("✅ Usuario autenticado:", authorId);
    
    const { content } = req.body;
    console.log(req.body);
    
    const articleData = { content, authorId };

    if (req.files && req.files.image) {
      const file = req.files.image;
      
      const fileUrl = await uploadFile(file);
      articleData.fileUrl = fileUrl;
    } else {
      console.log("⚠️ No se ha subido imagen.");
    }


    const article = new Article(articleData);
    await article.save();

    res.status(201).json({
      message: "Articulo publicado con éxito",
      article: {
        _id: article._id,
        content: article.content,
        fileUrl: article.fileUrl || null,
        authorId: article.authorId,
        likes: []
      },
    });

  } catch (error) {
    console.error("❌ Error en createArticle:", error);
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};
// Obtener todos los artículos
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 }).populate('authorId')
    res.status(201).json(articles)

  } catch (error) {
    res.status(500).json({ message: "Error del servido", error })
  }

}
// Obtener artículos de un usuario específico
exports.getUserArticles = async (req, res) => {
  try {
    const userId = req.user._id;

    const articles = await Article.find({ authorId: userId }).populate('authorId');

    res.status(200).json(articles);
  } catch (error) {
    console.error("❌ Error en getUserArticles:", error);
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};
// Eliminar un artículo
exports.deleteArticle = async (req, res) => {
  console.log("🔄 Solicitud para eliminar artículo con ID:", req.params.id);
  
  try {
    const { id } = req.params; 
    const article = await Article.findById(id).exec(); 

    if (!article) {
      return res.status(404).json({ message: 'Articulo no encontrado' }) 
    }

    if (article.fileUrl) {
      // Extraer el nombre del archivo
      const fullUrl = article.fileUrl;
      const fileName = fullUrl.split("/").pop();

      // Elimina el archivo de S3
      await deleteFile(fileName);
    }
    try {
      // Eliminar el articulo de la base de datos
      await article.deleteOne();

    } catch (error) {
      console.error("❌ Error en article.remove():", error);
      return res.status(500).json({ message: 'Error al eliminar el articulo de la base de datos', error })
    }

    res.status(200).json({ message: 'Articulo eliminado exitosamente' })

  } catch (error) {
    res.status(500).json({ message: 'Error del servidor:', error }) 
  }
}


exports.likeArticle = async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user._id;

  try {
    const post = await Article.findById(postId);
    if (!post) return res.status(404).send('Post no encontrado');

    const alreadyLiked = post.likes.some(id => id?.equals(userId));

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => !id?.equals(userId));
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error interno');
  }
};

