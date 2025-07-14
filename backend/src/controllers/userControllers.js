require("dotenv").config();
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const User = require("../models/users");

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "El usuario ya existe" });

    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};
// Iniciar sesión de usuario & autenticar
exports.loginUser = async (req, res) => {

  try {
    const { email, password } = req.body; 

    const user = await User.findOne({ email }); 

    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" }); 
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales incorrectas" }); 
    }

    const token = jwt.sign({ _id: user._id, email: user.email }, SECRET_KEY, {
      expiresIn: '1d'
    });

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage 
      }
    });


  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};
// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
}
// Obtener un usuario autenticado
exports.getAuthenticatedUser = async (req, res) => {
  try {

    const id = req.user._id; 

    const user = await User.findById(id); 
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" }); 
    }
    res.status(200).json(user); 
  }
  catch (error) {
    res.status(500).json({ message: "Error en el servidor", error }); 
  }
}

// Eliminar un usuario por ID
exports.deleteUser = async (req, res) => {

  try {

    const id = req.user._id; 

    const user = await User.findById(id).exec();  
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" }); 
    }
    try {

      await user.deleteOne();
    }
    catch (error) {
      console.error("❌ Error en article.remove():", error);
      return res.status(500).json({ message: 'Error al eliminar el articulo de la base de datos', error });
    }

    res.status(200).json({ message: "Usuario eliminado con éxito" }); 
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error }); 
  }
}
// Actualizar un usuario
exports.updateUser = async (req, res) => {
  try {
    console.log(req.body);

    const id = req.user._id;
    const { name, email, bio, profileImage } = req.body; 

    const user = await User.findByIdAndUpdate(id, { name, email, bio, profileImage }, { new: true, runValidators: true });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" }); 
    }

    res.status(200).json({ message: "Usuario actualizado con éxito", user }); 
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error }); 
  }
}

