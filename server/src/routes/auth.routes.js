const express = require("express");
const { register, login, refreshToken, logout, getProfile, updateProfile } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/me", authMiddleware, getProfile);
router.patch("/me", authMiddleware, updateProfile);

module.exports = router;
