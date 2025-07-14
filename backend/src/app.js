const express = require("express");
const userRouter = require("./routes/userRouter");
const articleRouter = require("./routes/articleRouter");
const commentRouter = require("./routes/commentRouter");
const fileUpload = require('express-fileupload');
const cors = require("cors")


const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload({
    useTempFiles: false,
}));

app.use("/api/users", userRouter);
app.use("/api/articles", articleRouter);
app.use("/api/comments", commentRouter);

module.exports = app;
