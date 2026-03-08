const cloudinary = require('cloudinary').v2;

// Configuración
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Sube un archivo a Cloudinary
 * @param {string} filePath - Ruta local o buffer del archivo
 */
const uploadFile = async (fileObject, folderName) => {
  try {
    // 1. Convertimos el Buffer a un String Base64 que Cloudinary entienda
    const base64Image = Buffer.from(fileObject.data).toString('base64');
    const dataURI = `data:${fileObject.mimetype};base64,${base64Image}`;
    
    
    // 2. Subimos ese String

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folderName,
      resource_type: 'auto'
    });
    
    return result.url; // Devuelve la URL del archivo subido
  } catch (error) {
    console.error("Error detallado:", error);
    throw error;
  }
};

/**
 * Elimina un archivo de Cloudinary
 * @param {string} publicId - El ID público del archivo (se obtiene de la URL o del objeto de subida)
 */
const deleteFile = async (fileUrl) => {
  try {
    // 1. Extraer el publicId de la URL
    // Esto quita el dominio y la extensión (.png, .jpg, etc.)
    const parts = fileUrl.split('/');
    const fileNameWithExtension = parts.pop();
    const folderFather = parts[7];
    const folder = parts.pop();
    const publicId = `${folderFather}/${folder}/${fileNameWithExtension.split('.')[0]}`;

    // 2. Ejecutar la eliminación
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    
    if (result.result === 'not found') {
      console.log("⚠️ Cloudinary no encontró el archivo. Revisa el publicId.");
    }
    
    return result;
  } catch (error) {
    console.error("Error al borrar:", error);
  }
};

module.exports = { uploadFile, deleteFile };