// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error("❌ Error capturado:", err); // Para debug en consola

  let statusCode = 500; // Por defecto: error del servidor
  let message = 'Internal Server Error';
  let code = 'INTERNAL_SERVER_ERROR'; // Código interno de la app
  let errors = []; // Lista para detalles de errores

  // ⚠️ 1. Errores de validación de Mongoose (model.validate)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';

    // Convertimos el objeto de errores en un array de mensajes
    errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // ⚠️ 2. Error por id inválido en Mongo (CastError)
  else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  }

  // ⚠️ 3. Errores personalizados
  else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message || message;
    code = err.code || code;
    if (err.errors) errors = err.errors;
  }

  // ⚠️ 4. Otros errores: mantener mensaje del error
  else if (err.message) {
    message = err.message;
  }

  // 📦 5. Responder al cliente
  res.status(statusCode).json({
    success: false,
    message,
    code,
    errors
  });
};
