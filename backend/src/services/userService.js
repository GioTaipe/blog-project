const { uploadFile, deleteFile } = require("../utils/cloudinary");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
const userRepository = require("../repositories/userRepository");

const createUser = async ({ name, email, password }) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error("El usuario ya existe");
    error.statusCode = 400;
    throw error;
  }

  const newUser = await userRepository.create({ name, email, password });

  return {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
};

const loginUser = async (email, password) => {
  if (!process.env.SECRET_KEY) {
    throw new Error("CRITICAL: SECRET_KEY no está definida en el entorno");
  }
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error("Credenciales incorrectas");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Credenciales incorrectas");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign({ _id: user._id, email: user.email }, SECRET_KEY, {
    expiresIn: "1d",
  });

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

const getAllUsers = async () => {
  const users = await userRepository.findAll();
  return users;
};

const getAuthenticatedUser = async (userId) => {
  const user = await userRepository.findById(userId);
  return user;
};

const deleteUser = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  await userRepository.deleteOne(userId);
};

const updateUser = async (userId, updateData) => {
  // Prevent email changes for security
  delete updateData.email;

  const user = await userRepository.updateById(userId, updateData);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const updateProfileImage = async (userId, fileObject) => {

  // 1. Borrar la foto vieja si existe (usando tu deleteFile)
  const user = await userRepository.findById(userId);
  if (user.profileImage) {
    await deleteFile(user.profileImage);
  }

  // 2. Subir la nueva indicando la carpeta de perfiles
  const newImageUrl = await uploadFile(fileObject, "BLOG/IMAGES-PROFILE");

  // 3. Actualizar en la DB
  const updatedUser = await userRepository.updateById(userId, {
    profileImage: newImageUrl
  });

  return updatedUser;
};

const searchUsers = async (query) => {
  if (!query || query.trim().length === 0) {
    return [];
  }
  const users = await userRepository.searchByName(query);
  return users;
};

const getPublicProfile = async (userId) => {
  const user = await userRepository.findByIdPublic(userId);
  
  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const updateBanner = async (userId, fileObject) => {
  // 1. Borrar la imagen existente
  const user = await userRepository.findById(userId)

  if( user.bannerImage ){
     await deleteFile(user.bannerImage)
  }
   // 2. Subir la nueva indicando la carpeta de perfiles
  const newImageBannerUrl = await uploadFile(fileObject, "BLOG/IMAGES-BANNER");
  
  // 3. Actualizar en la DB
  const updatedBanner = await userRepository.updateById(userId, {
    bannerImage: newImageBannerUrl
  });

  return updatedBanner;

};

module.exports = {
  createUser,
  loginUser,
  updateProfileImage,
  getAllUsers,
  getAuthenticatedUser,
  deleteUser,
  updateUser,
  searchUsers,
  getPublicProfile,
  updateBanner,
};
