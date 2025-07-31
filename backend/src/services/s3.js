const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { AWS_BUCKET_NAME, AWS_BUCKET_REGION, AWS_PUBLIC_KEY, AWS_SECRET_ACCESS_KEY } = require('../config/settings.js');

const s3 = new S3Client({
    region: AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: AWS_PUBLIC_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

const uploadFile = async (image) => {
    
    const params = {
        Bucket: AWS_BUCKET_NAME,
        Key: image.name,
        Body: image.data,
        ContentType: image.mimetype // Esta linea es para poder decirle a s3 que tipo de archivo se envia
    };

    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        console.log("File uploaded successfully");
        // Generar la URL pública de la imagen
        return `https://${AWS_BUCKET_NAME}.s3.${AWS_BUCKET_REGION}.amazonaws.com/${image.name}`;
    } catch (err) {
        console.error("Error uploading file:", err);
    }
};

const deleteFile = async (fileName) => {
    const params = {
        Bucket: AWS_BUCKET_NAME,
        Key: fileName,
    };

    try {
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
        console.log("File deleted successfully");
    } catch (err) {
        console.error("Error deleting file:", err);
    }
}

module.exports = { uploadFile, deleteFile };
