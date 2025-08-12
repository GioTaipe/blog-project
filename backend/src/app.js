const express = require("express");
const userRouter = require("./routes/userRouter");
const articleRouter = require("./routes/articleRouter");
const commentRouter = require("./routes/commentRouter");
const fileUpload = require('express-fileupload');
const cors = require("cors")
const errorHandler = require('./middleware/errorHandler')

const app = express();
app.use(cors());
app.use(express.static('dist'));
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.use(fileUpload({
    useTempFiles: false,
}));

app.use("/api/users", userRouter);
app.use("/api/articles", articleRouter);
app.use("/api/comments", commentRouter);
app.use(errorHandler);

module.exports = app;
