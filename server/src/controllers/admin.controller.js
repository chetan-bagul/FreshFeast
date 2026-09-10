const User = require("../models/User");
const Kitchen = require("../models/Kitchen");
const Dish = require("../models/Dish");
const Order = require("../models/Order");
const DeliveryTask = require("../models/DeliveryTask");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");

const overview = asyncHandler(async (req, res) => {
  const [users, kitchens, dishes, orders, sales, activeDeliveries] = await Promise.all([
    User.countDocuments(), Kitchen.countDocuments(), Dish.countDocuments(), Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    DeliveryTask.countDocuments({ status: { $ne: "delivered" } }),
  ]);
  res.json({ success: true, stats: { users, kitchens, dishes, orders, activeDeliveries, sales: sales[0]?.total || 0 } });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, users });
});
const listKitchens = asyncHandler(async (req, res) => {
  const kitchens = await Kitchen.find().populate("owner", "name email phone").sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, kitchens });
});
const listDishes = asyncHandler(async (req, res) => {
  const dishes = await Dish.find().populate("kitchen", "name").sort({ createdAt: -1 }).limit(300);
  res.json({ success: true, dishes });
});
const listOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email phone").populate("kitchen", "name").populate("deliveryAgent", "name phone").sort({ createdAt: -1 }).limit(300);
  res.json({ success: true, orders });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["user", "kitchen", "delivery", "admin"].includes(role)) throw new ApiError(400, "Invalid role");
  if (String(req.user._id) === req.params.id && role !== "admin") throw new ApiError(400, "You cannot remove your own admin role");
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  req.app.get("io").emit("admin:dataChanged");
  res.json({ success: true, user });
});

const updateOrder = asyncHandler(async (req, res) => {
  const allowed = ["placed", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];
  if (!allowed.includes(req.body.status)) throw new ApiError(400, "Invalid order status");
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  order.status = req.body.status;
  if (order.status === "delivered") order.deliveredAt = new Date();
  await order.save();
  req.app.get("io").emit("admin:dataChanged");
  res.json({ success: true, order });
});

const updateDishAvailability = asyncHandler(async (req, res) => {
  if (typeof req.body.isAvailable !== "boolean") throw new ApiError(400, "isAvailable must be true or false");
  const dish = await Dish.findByIdAndUpdate(req.params.id, { isAvailable: req.body.isAvailable }, { new: true });
  if (!dish) throw new ApiError(404, "Dish not found");
  req.app.get("io").emit("admin:dataChanged");
  res.json({ success: true, dish });
});

module.exports = { overview, listUsers, listKitchens, listDishes, listOrders, updateUserRole, updateOrder, updateDishAvailability };
