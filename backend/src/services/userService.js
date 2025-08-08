require("dotenv").config();
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const userRepository = require("../repositories/userRepository");

const createUser = async ({ name, email, password, role }) => {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        const error = new Error("El usuario ya existe");
        error.statusCode = 400;
        throw error;
    }

    const newUser = await userRepository.create({ name, email, password, role });

    return {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
    };
};

const loginUser = async (email, password) => {
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
        expiresIn: '1d',
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
    const user = await userRepository.updateById(userId, updateData);

    if (!user) {
        const error = new Error("Usuario no encontrado");
        error.statusCode = 404;
        throw error;
    }

    return user;
};


module.exports = {
    createUser,
    loginUser,
    getAllUsers,
    getAuthenticatedUser,
    deleteUser,
    updateUser
};
