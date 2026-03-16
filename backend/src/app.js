const express = require("express");
const userRouter = require("./routes/userRouter");
const postRouter = require("./routes/postRouter");
const commentRouter = require("./routes/commentRouter");
const authRouter = require("./routes/authRouter");
const fileUpload = require('express-fileupload');
const cors = require("cors")
const errorHandler = require('./middleware/errorHandler')

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload({
    useTempFiles: false,
}));

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/auth", authRouter);
app.use(errorHandler);

module.exports = app;
