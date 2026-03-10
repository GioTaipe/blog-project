const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (credential) => {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload.email_verified) {
    const error = new Error("La cuenta de Google no tiene email verificado");
    error.statusCode = 401;
    throw error;
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    profileImage: payload.picture || "",
  };
};

const googleLogin = async (credential) => {
  if (!process.env.SECRET_KEY) {
    throw new Error("CRITICAL: SECRET_KEY no está definida en el entorno");
  }

  const googleUser = await verifyGoogleToken(credential);

  // Buscar usuario existente por email
  let user = await userRepository.findByEmail(googleUser.email);

  if (user) {
    // Si el usuario existe pero se registró con email/password, vincular Google
    if (!user.googleId) {
      user = await userRepository.updateById(user._id, {
        googleId: googleUser.googleId,
        authProvider: "google",
      });
    }
  } else {
    // Crear nuevo usuario con Google
    user = await userRepository.create({
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.googleId,
      authProvider: "google",
      profileImage: googleUser.profileImage,
    });
  }

  const token = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.SECRET_KEY,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
    },
  };
};

module.exports = { googleLogin };
