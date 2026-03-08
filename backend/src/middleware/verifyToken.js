const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const SECRET = process.env.SECRET_KEY;

  // 1. Controlar que la llave exista en el servidor
  if (!SECRET) {
    console.error("ERROR: SECRET_KEY missing in .env");
    return res.status(500).json({ message: 'Error interno de configuración' });
  }

  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No proporcionaste un token válido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verificación estricta
    const decoded = jwt.verify(token, SECRET);
    
    // 3. Verificación extra: ¿El ID viene en el token?
    if (!decoded._id) {
        throw new Error("Token mal formado");
    }

    req.user = decoded; 
    next();
  } catch (error) {
    // Si el secreto cambió, entrará aquí siempre
    return res.status(403).json({ 
        message: 'Sesión inválida o expirada. Por favor, inicia sesión de nuevo.',
        error: error.message 
    });
  }
};

module.exports = verifyToken;
