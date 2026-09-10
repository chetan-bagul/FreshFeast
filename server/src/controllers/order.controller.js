const Order = require("../models/Order");
const Dish = require("../models/Dish");
const Kitchen = require("../models/Kitchen");
const DeliveryTask = require("../models/DeliveryTask");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");
const { emitToRoom } = require("../sockets");
const DELIVERY_CHARGE = 20;

// Valid forward-only status transitions. Prevents e.g. jumping from "placed" to "delivered".
const STATUS_FLOW = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

// POST /api/v1/orders  (role: user)
const placeOrder = asyncHandler(async (req, res) => {
  const { kitchenId, items, deliveryAddress } = req.body;
  if (!kitchenId || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "kitchenId and at least one item are required");
  }

  const kitchen = await Kitchen.findById(kitchenId);
  if (!kitchen || kitchen.status !== "approved" || !kitchen.isOpen) {
    throw new ApiError(400, "This kitchen is not currently accepting orders");
  }
  if (!deliveryAddress?.pincode || !/^\d{6}$/.test(String(deliveryAddress.pincode))) {
    throw new ApiError(400, "A valid 6-digit delivery pincode is required");
  }
  if (String(kitchen.location?.pincode) !== String(deliveryAddress.pincode).trim()) {
    throw new ApiError(400, "This kitchen does not deliver to the selected pincode");
  }

  // Re-price server-side from the DB — never trust client-submitted prices
  const dishIds = items.map((i) => i.dishId);
  const dishes = await Dish.find({ _id: { $in: dishIds }, kitchen: kitchenId });

  const orderItems = items.map((reqItem) => {
    const dish = dishes.find((d) => String(d._id) === reqItem.dishId);
    if (!dish) throw new ApiError(400, `Dish ${reqItem.dishId} not found in this kitchen`);
    if (!dish.isAvailable) throw new ApiError(400, `${dish.name} is currently unavailable`);
    if (!Number.isInteger(reqItem.qty) || reqItem.qty < 1) {
      throw new ApiError(400, "Each dish quantity must be at least 1");
    }
    return { dish: dish._id, name: dish.name, price: dish.price, qty: reqItem.qty };
  });

  const subtotalAmount = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  // Always calculate this on the server, rather than trusting a client value.
  const totalAmount = subtotalAmount + DELIVERY_CHARGE;

  const order = await Order.create({
    user: req.user._id,
    kitchen: kitchenId,
    items: orderItems,
    subtotalAmount,
    deliveryCharge: DELIVERY_CHARGE,
    totalAmount,
    deliveryAddress,
  });

  const io = req.app.get("io");
  emitToRoom(io, `kitchen:${kitchenId}`, "order:new", {
    orderId: order._id,
    totalAmount: order.totalAmount,
    itemCount: orderItems.length,
  });
  emitToRoom(io, `user:${kitchen.owner}`, "order:new", { orderId: order._id });
  io.emit("admin:dataChanged");

  res.status(201).json({ success: true, order });
});

// GET /api/v1/orders/mine  (role: user)
const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("kitchen", "name coverImageUrl")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
});

// GET /api/v1/orders/:id  (order owner, kitchen owner, or assigned delivery agent)
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("kitchen", "name owner location")
    .populate("user", "name phone");
  if (!order) throw new ApiError(404, "Order not found");

  const isOwner = String(order.user._id) === String(req.user._id);
  const isKitchenOwner = String(order.kitchen.owner) === String(req.user._id);
  const isDeliveryAgent = order.deliveryAgent && String(order.deliveryAgent) === String(req.user._id);

  if (!isOwner && !isKitchenOwner && !isDeliveryAgent && req.user.role !== "admin") {
    throw new ApiError(403, "You do not have access to this order");
  }

  res.json({ success: true, order });
});

// PATCH /api/v1/orders/:id/cancel  (role: user, pre-confirmation only)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  if (String(order.user) !== String(req.user._id)) {
    throw new ApiError(403, "You can only cancel your own orders");
  }
  if (!order.isCancellable()) {
    throw new ApiError(400, `Order cannot be cancelled once it is '${order.status}'`);
  }

  order.status = "cancelled";
  order.cancelReason = req.body.reason || "Cancelled by customer";
  await order.save();

  const io = req.app.get("io");
  emitToRoom(io, `kitchen:${order.kitchen}`, "order:statusUpdate", {
    orderId: order._id,
    status: "cancelled",
  });
  io.emit("admin:dataChanged");

  res.json({ success: true, order });
});

// PATCH /api/v1/orders/:id/status  (role: kitchen owner or delivery agent)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate("kitchen", "owner");
  if (!order) throw new ApiError(404, "Order not found");

  const isKitchenOwner = String(order.kitchen.owner) === String(req.user._id);
  const isDeliveryAgent = order.deliveryAgent && String(order.deliveryAgent) === String(req.user._id);
  if (!isKitchenOwner && !isDeliveryAgent) {
    throw new ApiError(403, "You are not permitted to update this order");
  }

  const allowedNext = STATUS_FLOW[order.status] || [];
  if (!allowedNext.includes(status)) {
    throw new ApiError(400, `Cannot move order from '${order.status}' to '${status}'`);
  }

  order.status = status;
  if (status === "delivered") order.deliveredAt = new Date();
  await order.save();

  const io = req.app.get("io");
  emitToRoom(io, `user:${order.user}`, "order:statusUpdate", {
    orderId: order._id,
    status: order.status,
  });
  emitToRoom(io, `user:${order.kitchen.owner}`, "order:statusUpdate", { orderId: order._id, status: order.status });
  if (status === "ready") io.emit("delivery:availableChanged");
  io.emit("admin:dataChanged");

  res.json({ success: true, order });
});

// GET /api/v1/kitchens/:id/orders  (kitchen owner)
const ordersForKitchen = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.findById(req.params.id);
  if (!kitchen) throw new ApiError(404, "Kitchen not found");
  if (String(kitchen.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You do not own this kitchen");
  }

  const { status } = req.query;
  const filter = { kitchen: kitchen._id };
  if (status) filter.status = status;

  const orders = await Order.find(filter).populate("user", "name phone").sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
});

// POST /api/v1/kitchens/:id/orders/:orderId/assign-delivery (kitchen owner)
const assignDeliveryAgent = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.findById(req.params.id);
  if (!kitchen) throw new ApiError(404, "Kitchen not found");
  if (String(kitchen.owner) !== String(req.user._id)) throw new ApiError(403, "You do not own this kitchen");

  const order = await Order.findOne({ _id: req.params.orderId, kitchen: kitchen._id });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.status !== "ready") throw new ApiError(400, "Only ready orders can be assigned to delivery");

  const agent = await User.findOne({ _id: req.body.agentId, role: "delivery" });
  if (!agent) throw new ApiError(400, "Select a valid delivery agent");
  if (await DeliveryTask.exists({ order: order._id })) throw new ApiError(409, "This order is already assigned");

  const task = await DeliveryTask.create({ order: order._id, agent: agent._id, earnings: order.deliveryCharge || DELIVERY_CHARGE });
  order.deliveryAgent = agent._id;
  order.status = "out_for_delivery";
  await order.save();

  const io = req.app.get("io");
  emitToRoom(io, `user:${agent._id}`, "delivery:assigned", { taskId: task._id, orderId: order._id });
  emitToRoom(io, `user:${order.user}`, "order:statusUpdate", { orderId: order._id, status: order.status });
  io.emit("admin:dataChanged");
  res.status(201).json({ success: true, task, order });
});

module.exports = {
  placeOrder,
  myOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
  ordersForKitchen,
  assignDeliveryAgent,
};
