const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require('./articles');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    bio: { type: String, trim: true, default: "" },
    profileImage: { type: String, default: "" },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

UserSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  console.log("✅ Middleware pre('deleteOne') ejecutado para artículo:", this._id);
  const Article = mongoose.model("Article");

  const articles = await Article.find({ authorId: this._id });

  for (const article of articles) {
    await article.deleteOne(); 
  }

  next();
});

// Middleware para encriptar la contraseña antes de guardar
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Middleware para encriptar la contraseña antes de actualizar
UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
  }
  next();
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
