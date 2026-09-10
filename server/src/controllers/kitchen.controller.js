const Kitchen = require("../models/Kitchen");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");

// POST /api/v1/kitchens  (role: kitchen)
const createKitchen = asyncHandler(async (req, res) => {
  const { name, description, location, coverImageUrl } = req.body;
  if (!name) throw new ApiError(400, "Kitchen name is required");
  if (!location?.pincode || !/^\d{6}$/.test(String(location.pincode))) {
    throw new ApiError(400, "A valid 6-digit kitchen pincode is required");
  }

  const existingKitchen = await Kitchen.findOne({ owner: req.user._id });
  if (existingKitchen) throw new ApiError(409, "You already have a kitchen profile");

  const kitchen = await Kitchen.create({
    owner: req.user._id,
    name,
    description,
    location,
    coverImageUrl,
    // Development can publish immediately; production should keep the default pending state for review.
    ...(process.env.KITCHEN_AUTO_APPROVE === "true" ? { status: "approved" } : {}),
  });

  res.status(201).json({ success: true, kitchen });
});

// GET /api/v1/kitchens/mine (kitchen owner)
const getMyKitchen = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.findOne({ owner: req.user._id });
  res.json({ success: true, kitchen });
});

// GET /api/v1/kitchens  (public — home feed of open, approved kitchens)
const listKitchens = asyncHandler(async (req, res) => {
  const { city, pincode } = req.query;
  const filter = { status: "approved", isOpen: true };
  if (city) filter["location.city"] = new RegExp(city, "i");
  if (pincode) filter["location.pincode"] = String(pincode).trim();

  const kitchens = await Kitchen.find(filter).sort({ "rating.avg": -1 });
  res.json({ success: true, count: kitchens.length, kitchens });
});

// GET /api/v1/kitchens/:id
const getKitchen = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.findById(req.params.id);
  if (!kitchen) throw new ApiError(404, "Kitchen not found");
  res.json({ success: true, kitchen });
});

// PUT /api/v1/kitchens/:id  (owner only)
const updateKitchen = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.findById(req.params.id);
  if (!kitchen) throw new ApiError(404, "Kitchen not found");
  if (String(kitchen.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You do not own this kitchen");
  }
  if (req.body.location?.pincode && !/^\d{6}$/.test(String(req.body.location.pincode))) {
    throw new ApiError(400, "Kitchen pincode must be 6 digits");
  }

  const allowedFields = ["name", "description", "location", "coverImageUrl", "isOpen"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) kitchen[field] = req.body[field];
  });

  await kitchen.save();
  res.json({ success: true, kitchen });
});

// PATCH /api/v1/kitchens/:id/status  (admin only — approve/suspend)
const setKitchenStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["pending", "approved", "suspended"].includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }
  const kitchen = await Kitchen.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!kitchen) throw new ApiError(404, "Kitchen not found");
  req.app.get("io").emit("admin:dataChanged");
  res.json({ success: true, kitchen });
});

// GET /api/v1/kitchens/:id/analytics  (owner only)
const getKitchenAnalytics = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.findById(req.params.id);
  if (!kitchen) throw new ApiError(404, "Kitchen not found");
  if (String(kitchen.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You do not own this kitchen");
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

  const [dailyAgg, monthlyAgg, statusBreakdown] = await Promise.all([
    Order.aggregate([
      { $match: { kitchen: kitchen._id, createdAt: { $gte: startOfToday }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, orderCount: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { kitchen: kitchen._id, createdAt: { $gte: startOfMonth }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, orderCount: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { kitchen: kitchen._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    daily: dailyAgg[0] || { totalSales: 0, orderCount: 0 },
    monthly: monthlyAgg[0] || { totalSales: 0, orderCount: 0 },
    statusBreakdown,
  });
});

module.exports = {
  createKitchen,
  getMyKitchen,
  listKitchens,
  getKitchen,
  updateKitchen,
  setKitchenStatus,
  getKitchenAnalytics,
};
