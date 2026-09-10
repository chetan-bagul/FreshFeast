const express = require("express");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const {
  homeFeed,
  updateDish,
  toggleAvailability,
  deleteDish,
} = require("../controllers/dish.controller");

const router = express.Router();

router.get("/home-feed", homeFeed);
router.put("/:id", authMiddleware, requireRole(["kitchen"]), updateDish);
router.patch("/:id/availability", authMiddleware, requireRole(["kitchen"]), toggleAvailability);
router.delete("/:id", authMiddleware, requireRole(["kitchen"]), deleteDish);

module.exports = router;
