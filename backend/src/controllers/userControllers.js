const userService = require("../services/userService");
const asyncHandler = require('../utils/asyncHandler')

// Crear un nuevo usuario
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const newUser = await userService.createUser({ name, email, password, role });

  res.status(201).json({
    message: "Usuario registrado con éxito",
    user: newUser
  });
});
// Iniciar sesión de usuario & autenticar
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { token, user } = await userService.loginUser(email, password);

  res.status(200).json({ token, user });
});
// Obtener todos los usuarios
exports.getAllUsers = (async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json(users);
});
// Obtener un usuario autenticado
exports.getAuthenticatedUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await userService.getAuthenticatedUser(userId);
  res.status(200).json(user);
});

// Eliminar un usuario por ID
exports.deleteUser = asyncHandler(async (req, res) => {
  const id = req.user._id;

  await userService.deleteUser(id);

  res.status(200).json({ message: "Usuario eliminado con éxito" });
});
// Actualizar un usuario
exports.updateUser = asyncHandler(async (req, res) => {
  const id = req.user._id;
  console.log("Datos a actualizar:", req.body);
  
  const dataToUpdate = req.body;

  const updatedUser = await userService.updateUser(id, dataToUpdate);

  res.status(200).json({
    message: "Usuario actualizado con éxito",
    user: updatedUser,
  });
});


