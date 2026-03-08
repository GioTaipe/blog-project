const User = require("../models/users");

const create = (data) => new User(data).save();
const findByEmail = (email) => User.findOne({ email });
const findById = (id) => User.findById(id).select("-password");
const findAll = () => User.find().select("-password");
const deleteOne = async (id) => {
  const user = await User.findById(id);
  if (!user) return null;
  return await user.deleteOne(); 
};

const updateById = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const searchByName = (query) => {
  return User.find({ 
    name: { $regex: query, $options: 'i' } 
  }).select("-password").limit(10);
};

const findByIdPublic = (id) => {
  return User.findById(id).select("name bio profileImage bannerImage createdAt");
};

module.exports = {
    create,
    findByEmail,
    findById,
    findAll,
    deleteOne,
    updateById,
    searchByName,
    findByIdPublic
};
