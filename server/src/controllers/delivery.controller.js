const DeliveryTask = require("../models/DeliveryTask");
const Order = require("../models/Order");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");
const { emitToRoom } = require("../sockets");

const availableTasks = asyncHandler(async (req, res) => {
  const orders = await Order.find({ status: "ready", deliveryAgent: null })
    .populate("kitchen", "name location")
    .select("kitchen items deliveryAddress subtotalAmount deliveryCharge totalAmount createdAt")
    .sort({ createdAt: 1 });
  res.json({ success: true, count: orders.length, orders });
});

const claimTask = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) throw new ApiError(400, "orderId is required");

  // One atomic update makes the first delivery partner the only successful claimant.
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: "ready", deliveryAgent: null },
    { $set: { deliveryAgent: req.user._id, status: "out_for_delivery" } },
    { new: true }
  );
  if (!order) throw new ApiError(409, "This delivery is no longer available");

  let task;
  try {
    task = await DeliveryTask.create({ order: order._id, agent: req.user._id, earnings: order.deliveryCharge || 20 });
  } catch (error) {
    order.deliveryAgent = null;
    order.status = "ready";
    await order.save();
    throw error;
  }

  const io = req.app.get("io");
  emitToRoom(io, `user:${order.user}`, "order:statusUpdate", { orderId: order._id, status: order.status });
  emitToRoom(io, `kitchen:${order.kitchen}`, "order:statusUpdate", { orderId: order._id, status: order.status });
  io.emit("delivery:availableChanged");
  io.emit("admin:dataChanged");
  res.status(201).json({ success: true, task, order });
});

// GET /api/v1/delivery/agents (role: kitchen)
const listAgents = asyncHandler(async (req, res) => {
  const agents = await User.find({ role: "delivery" }).select("name email phone").sort({ name: 1 });
  res.json({ success: true, count: agents.length, agents });
});

// GET /api/v1/delivery/tasks  (role: delivery)
const myTasks = asyncHandler(async (req, res) => {
  const tasks = await DeliveryTask.find({ agent: req.user._id, status: { $ne: "delivered" } })
    .populate({ path: "order", populate: { path: "kitchen", select: "name location" } })
    .sort({ createdAt: -1 });
  res.json({ success: true, count: tasks.length, tasks });
});

// PATCH /api/v1/delivery/tasks/:id/status  (role: delivery, assigned agent only)
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["picked_up", "in_transit", "delivered"];
  if (!allowed.includes(status)) throw new ApiError(400, "Invalid status value");

  const task = await DeliveryTask.findById(req.params.id);
  if (!task) throw new ApiError(404, "Delivery task not found");
  if (String(task.agent) !== String(req.user._id)) {
    throw new ApiError(403, "This task is not assigned to you");
  }

  task.status = status;
  if (status === "delivered") task.deliveredAt = new Date();
  await task.save();

  // Keep the parent Order's status in sync with the delivery task
  const order = await Order.findById(task.order);
  if (order) {
    if (status === "picked_up" || status === "in_transit") order.status = "out_for_delivery";
    if (status === "delivered") {
      order.status = "delivered";
      order.deliveredAt = new Date();
    }
    await order.save();

    const io = req.app.get("io");
    emitToRoom(io, `user:${order.user}`, "order:statusUpdate", {
      orderId: order._id,
      status: order.status,
    });
    io.emit("admin:dataChanged");
  }

  res.json({ success: true, task });
});

// GET /api/v1/delivery/earnings  (role: delivery)
const myEarnings = asyncHandler(async (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const week = new Date(today);
  week.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const month = new Date(now.getFullYear(), now.getMonth(), 1);
  const sumSince = async (start) => {
    const result = await DeliveryTask.aggregate([
      { $match: { agent: req.user._id, createdAt: { $gte: start } } },
      { $group: { _id: null, amount: { $sum: "$earnings" }, count: { $sum: 1 } } },
    ]);
    return result[0] || { amount: 0, count: 0 };
  };
  const [total, todayEarnings, weekEarnings, monthEarnings, tasks] = await Promise.all([
    sumSince(new Date(0)), sumSince(today), sumSince(week), sumSince(month),
    DeliveryTask.find({ agent: req.user._id }).populate({ path: "order", select: "kitchen totalAmount deliveryCharge createdAt", populate: { path: "kitchen", select: "name" } }).sort({ createdAt: -1 }).limit(50),
  ]);
  res.json({ success: true, totalEarnings: total.amount, deliveryCount: total.count, today: todayEarnings, week: weekEarnings, month: monthEarnings, orderEarnings: tasks });
});

module.exports = { listAgents, availableTasks, claimTask, myTasks, updateTaskStatus, myEarnings };
