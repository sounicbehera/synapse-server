const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        let message = await Message.create(newMessage);

        // Deep populate fields to return full details to the frontend
        message = await message.populate("sender", "name pic email");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });

        // Update the parent Chat room document with this latest message
        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const allMessages = async (req, res) => {
    try {
        // Find all messages belonging to the chat ID passed in the URL parameters
        let messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");

        messages = await User.populate(messages, {
            path: "chat.users",
            select: "name pic email",
        });

        res.json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { sendMessage, allMessages };