const express = require("express");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const {
  createKitchen,
  getMyKitchen,
  listKitchens,
  getKitchen,
  updateKitchen,
  setKitchenStatus,
  getKitchenAnalytics,
} = require("../controllers/kitchen.controller");
const { listDishesForKitchen, createDish } = require("../controllers/dish.controller");
const { ordersForKitchen, assignDeliveryAgent } = require("../controllers/order.controller");

const router = express.Router();

router.get("/", listKitchens);
router.post("/", authMiddleware, requireRole(["kitchen"]), createKitchen);
router.get("/mine", authMiddleware, requireRole(["kitchen"]), getMyKitchen);
router.get("/:id", getKitchen);
router.put("/:id", authMiddleware, requireRole(["kitchen"]), updateKitchen);
router.patch("/:id/status", authMiddleware, requireRole(["admin"]), setKitchenStatus);
router.get("/:id/analytics", authMiddleware, requireRole(["kitchen"]), getKitchenAnalytics);

// Nested dish + order routes for convenience
router.get("/:kitchenId/dishes", listDishesForKitchen);
router.post("/:kitchenId/dishes", authMiddleware, requireRole(["kitchen"]), createDish);
router.get("/:id/orders", authMiddleware, requireRole(["kitchen"]), ordersForKitchen);
router.post("/:id/orders/:orderId/assign-delivery", authMiddleware, requireRole(["kitchen"]), assignDeliveryAgent);

module.exports = router;
