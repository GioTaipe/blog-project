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

const exchangeCodeForToken = async (code, redirectUri) => {
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET no está configurado en el entorno");
  }

  const oauthClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const { tokens } = await oauthClient.getToken(code);

  if (!tokens.id_token) {
    const error = new Error("No se recibió id_token de Google");
    error.statusCode = 401;
    throw error;
  }

  return tokens.id_token;
};

const findOrCreateUser = async (googleUser) => {
  if (!process.env.SECRET_KEY) {
    throw new Error("CRITICAL: SECRET_KEY no está definida en el entorno");
  }

  let user = await userRepository.findByEmail(googleUser.email);

  if (user) {
    if (!user.googleId) {
      user = await userRepository.updateById(user._id, {
        googleId: googleUser.googleId,
        authProvider: "google",
      });
    }
  } else {
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

const googleLogin = async (credential) => {
  const googleUser = await verifyGoogleToken(credential);
  return findOrCreateUser(googleUser);
};

const googleLoginWithCode = async (code, redirectUri) => {
  const idToken = await exchangeCodeForToken(code, redirectUri);
  const googleUser = await verifyGoogleToken(idToken);
  return findOrCreateUser(googleUser);
};

module.exports = { googleLogin, googleLoginWithCode };
