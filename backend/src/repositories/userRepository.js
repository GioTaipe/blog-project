const User = require("../models/users");

const create = (data) => new User(data).save();
const findByEmail = (email) => User.findOne({ email });
const findById = (id) => User.findById(id);
const findAll = () => User.find();
const deleteOne = async (id) => {
  const user = await User.findById(id);
  if (!user) return null;
  return await user.deleteOne(); // ✅ ejecuta el middleware
};

const updateById = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true, runValidators: true });

module.exports = {
    create,
    findByEmail,
    findById,
    findAll,
    deleteOne,
    updateById
};
