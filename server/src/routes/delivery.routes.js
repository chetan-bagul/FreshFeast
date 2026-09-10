const express = require("express");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const { listAgents, availableTasks, claimTask, myTasks, updateTaskStatus, myEarnings } = require("../controllers/delivery.controller");

const router = express.Router();

router.get("/agents", authMiddleware, requireRole(["kitchen"]), listAgents);

router.use(authMiddleware, requireRole(["delivery"]));

router.get("/available", availableTasks);
router.post("/tasks/claim", claimTask);
router.get("/tasks", myTasks);
router.patch("/tasks/:id/status", updateTaskStatus);
router.get("/earnings", myEarnings);

module.exports = router;
