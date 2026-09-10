const express = require("express");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const {
  placeOrder,
  myOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
} = require("../controllers/order.controller");

const router = express.Router();

router.use(authMiddleware); // every order route requires login

router.post("/", requireRole(["user"]), placeOrder);
router.get("/mine", requireRole(["user"]), myOrders);
router.get("/:id", getOrder); // access-checked inside controller
router.patch("/:id/cancel", requireRole(["user"]), cancelOrder);
router.patch("/:id/status", requireRole(["kitchen", "delivery"]), updateOrderStatus);

module.exports = router;
