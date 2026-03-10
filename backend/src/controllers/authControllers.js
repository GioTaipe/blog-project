const googleAuthService = require("../services/googleAuthService");
const asyncHandler = require("../utils/asyncHandler");

const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    const error = new Error("Token de Google requerido");
    error.statusCode = 400;
    throw error;
  }

  const { token, user } = await googleAuthService.googleLogin(credential);

  res.status(200).json({ token, user });
});

module.exports = { googleLogin };
