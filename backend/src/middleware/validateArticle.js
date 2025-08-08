// middleware/validateArticle.js
const { body, validationResult } = require('express-validator');

exports.validateCreateArticle = [
  body('content')
    .exists().withMessage('Content is required') // debe existir en el body
    .isString().withMessage('Content must be a string'), // y debe ser string
  (req, res, next) => {
    // recoge todos los errores de las validaciones anteriores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array()
      });
    }
    next(); 
  }
];
