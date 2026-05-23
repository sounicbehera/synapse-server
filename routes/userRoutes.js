const express = require("express");
const { registerUser, authUser, allUsers, sendOTP, verifyOTP } = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// CRITICAL: Ensure .get(protect, allUsers) is right here!
router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

module.exports = router;