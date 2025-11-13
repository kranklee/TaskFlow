const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

// GET /api/users/me 
router.get("/me", protect, userController.getMe);

module.exports = router;
