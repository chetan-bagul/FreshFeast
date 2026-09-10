const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/v1/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, pincode } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "name, email and password are required");
  }

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  // Only allow safe self-service roles at signup; 'admin' should never be settable here
  const allowedSelfRoles = ["user", "kitchen", "delivery"];
  const finalRole = allowedSelfRoles.includes(role) ? role : "user";

  if (pincode && !/^\d{6}$/.test(String(pincode))) {
    throw new ApiError(400, "Pincode must be 6 digits");
  }
  const user = await User.create({
    name, email, password, phone, role: finalRole,
    address: pincode ? [{ label: "Default", pincode: String(pincode) }] : [],
  });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.status(201).json({
    success: true,
    accessToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, pincode: user.address?.[0]?.pincode || "" },
  });
});

// POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "email and password are required");

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.json({
    success: true,
    accessToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, pincode: user.address?.[0]?.pincode || "" },
  });
});

// POST /api/v1/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token provided");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User no longer exists");

  const accessToken = generateAccessToken(user._id, user.role);
  res.json({ success: true, accessToken });
});

// POST /api/v1/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", cookieOptions);
  res.json({ success: true, message: "Logged out" });
});

const profileResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  role: user.role,
  pincode: user.address?.[0]?.pincode || "",
});

// GET /api/v1/auth/me
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: profileResponse(req.user) });
});

// PATCH /api/v1/auth/me
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone, pincode } = req.body;
  if (name !== undefined) req.user.name = name.trim();
  if (phone !== undefined) req.user.phone = phone.trim();
  if (email !== undefined && email.toLowerCase() !== req.user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && String(existing._id) !== String(req.user._id)) throw new ApiError(409, "That email address is already in use");
    req.user.email = email.toLowerCase().trim();
  }
  if (pincode !== undefined) {
    if (!/^\d{6}$/.test(String(pincode))) throw new ApiError(400, "Pincode must be 6 digits");
    const address = req.user.address?.[0] || { label: "Default" };
    address.pincode = String(pincode);
    req.user.address = [address];
  }
  await req.user.save();
  res.json({ success: true, user: profileResponse(req.user) });
});

module.exports = { register, login, refreshToken, logout, getProfile, updateProfile };
