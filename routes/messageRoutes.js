const express = require("express");
const { sendMessage, allMessages } = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, sendMessage);       // For sending messages
router.route("/:chatId").get(protect, allMessages);  // For fetching old message logs

module.exports = router;