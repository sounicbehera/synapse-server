const express = require("express");
const { accessChat, fetchChats, createGroupChat, renameGroup, removeFromGroup, addToGroup } = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Both routes share the root URL "/" but use different HTTP verbs
router.route("/").post(protect, accessChat); // POST to create or get a 1-on-1 chat
router.route("/").get(protect, fetchChats);  // GET to fetch all user chats

router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);

module.exports = router;