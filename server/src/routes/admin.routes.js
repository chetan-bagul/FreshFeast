const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const { overview, listUsers, listKitchens, listDishes, listOrders, updateUserRole, updateOrder, updateDishAvailability } = require("../controllers/admin.controller");
const { setKitchenStatus } = require("../controllers/kitchen.controller");

const router = express.Router();
router.use(auth, requireRole(["admin"]));
router.get("/overview", overview);
router.get("/users", listUsers);
router.get("/kitchens", listKitchens);
router.get("/dishes", listDishes);
router.get("/orders", listOrders);
router.patch("/users/:id/role", updateUserRole);
router.patch("/kitchens/:id/status", setKitchenStatus);
router.patch("/dishes/:id/availability", updateDishAvailability);
router.patch("/orders/:id/status", updateOrder);
module.exports = router;
