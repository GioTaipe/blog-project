const express = require("express");
const { googleLogin } = require("../controllers/authControllers");

const authRouter = express.Router();

authRouter.post("/google", googleLogin);

module.exports = authRouter;
