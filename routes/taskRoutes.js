const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");

router.post("/", protect, taskController.createTask);
router.get("/", protect, taskController.getTasks);
router.get("/:id", protect, taskController.getTaskById);
router.put("/:id", protect, taskController.updateTask);
router.delete("/:id", protect, taskController.deleteTask);
router.patch("/:id/delay", protect, taskController.delayTask);


module.exports = router;
