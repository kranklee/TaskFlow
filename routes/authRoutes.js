const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");


router.post("/register", authController.register);
router.post("/login", authController.login);


router.put("/change-password", protect, authController.changePassword);

module.exports = router;
