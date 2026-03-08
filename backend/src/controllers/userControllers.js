const userService = require("../services/userService");
const asyncHandler = require('../utils/asyncHandler')

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const newUser = await userService.createUser({ name, email, password });

  res.status(201).json({
    message: "Usuario registrado con éxito",
    user: newUser
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { token, user } = await userService.loginUser(email, password);

  res.status(200).json({ token, user });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json(users);
});

const getAuthenticatedUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await userService.getAuthenticatedUser(userId);
  
  res.status(200).json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const id = req.user._id;

  await userService.deleteUser(id);

  res.status(200).json({ message: "Usuario eliminado con éxito" });
});

const updateUser = asyncHandler(async (req, res) => {
  const id = req.user._id;
  
  const dataToUpdate = req.body;

  const updatedUser = await userService.updateUser(id, dataToUpdate);

  res.status(200).json({
    message: "Usuario actualizado con éxito",
    user: updatedUser,
  });
});

const updateProfileImage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const fileObject = req.files.profilePic;

  const updatedUser = await userService.updateProfileImage(userId, fileObject);

  res.status(200).json({
    message: "Imagen de perfil actualizada con éxito",
    user: updatedUser,
  });
});

const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const users = await userService.searchUsers(q);

  res.status(200).json(users);
});

const getPublicProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await userService.getPublicProfile(id);

  res.status(200).json(user);
});

const updateBanner = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const fileObject = req.files?.bannerImage;

  const updatedUser = await userService.updateBanner(userId, fileObject);

  res.status(200).json({
    message: "Banner actualizado",
    user: updatedUser,
  });
});

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
