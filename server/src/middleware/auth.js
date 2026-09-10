const jwt = require("jsonwebtoken");
const { ApiError } = require("./errorHandler");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

// Verifies the JWT access token sent in the Authorization header (Bearer <token>)
const authMiddleware = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authenticated — missing token");
  }

  const token = header.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user) throw new ApiError(401, "User no longer exists");

  req.user = user; // available to all downstream controllers
  next();
});

module.exports = authMiddleware;
