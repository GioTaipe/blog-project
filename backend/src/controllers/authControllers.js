const googleAuthService = require("../services/googleAuthService");
const asyncHandler = require("../utils/asyncHandler");

const googleLogin = asyncHandler(async (req, res) => {
  const { credential, code, redirectUri } = req.body;

  let result;

  if (code) {
    if (!redirectUri) {
      const error = new Error("redirectUri es requerido con el flujo de code");
      error.statusCode = 400;
      throw error;
    }
    result = await googleAuthService.googleLoginWithCode(code, redirectUri);
  } else if (credential) {
    result = await googleAuthService.googleLogin(credential);
  } else {
    const error = new Error("Se requiere 'credential' o 'code' para autenticar con Google");
    error.statusCode = 400;
    throw error;
  }

  res.status(200).json(result);
});

module.exports = { googleLogin };
