const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, minlength: 6 },
    googleId: { type: String, default: null },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    bio: { type: String, trim: true, default: "" },
    profileImage: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true },
);

UserSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const Post = mongoose.model("Post");
    const Comment = mongoose.model("Comment");

    // Eliminar comentarios de los posts del usuario (via hook del Post)
    const posts = await Post.find({ authorId: this._id });
    for (const post of posts) {
      await post.deleteOne();
    }

    // Eliminar comentarios que el usuario hizo en posts de otros
    await Comment.deleteMany({ author: this._id });

    next();
  },
);
UserSchema.pre("findOneAndDelete", async function (next) {
  const user = await this.model.findOne(this.getFilter());
  if (!user) return next();

  const Post = mongoose.model("Post");
  const Comment = mongoose.model("Comment");

  // Eliminar posts uno a uno para disparar el hook del Post (cascade a comentarios)
  const posts = await Post.find({ authorId: user._id });
  for (const post of posts) {
    await post.deleteOne();
  }

  // Eliminar comentarios que el usuario hizo en posts de otros
  await Comment.deleteMany({ author: user._id });

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
