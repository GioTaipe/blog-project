const { body, validationResult, oneOf } = require("express-validator");

const validatePost = [
  oneOf([
    body("content").trim().notEmpty(),
    body("image").custom((value, { req }) => {
      if (req.files && req.files.image) return true;
      return false;
    })
  ], {
    message: "Debes proporcionar al menos un texto o una imagen para publicar."
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = { validatePost };
