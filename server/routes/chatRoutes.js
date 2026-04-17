const router = require("express").Router();
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const validateObjectId = require("../middleware/validateObjectId");
/*
========================================
1. CREATE NEW CHAT
========================================
*/
router.post("/create", verifyToken, async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.body.receiverId;

    if (senderId === receiverId) {
      return res.status(400).json("Cannot chat with yourself");
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json("Receiver not found");
    }

    const existingChat = await Chat.findOne({
      members: { $all: [senderId, receiverId] }
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = new Chat({
      members: [senderId, receiverId]
    });

    const savedChat = await newChat.save();
    res.status(200).json(savedChat);

  } catch (err) {
    res.status(500).json(err);
  }
});
/*
========================================
2. SEND MESSAGE / SHARE POST IN DM
========================================
*/
router.post("/message", verifyToken, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { chatId, receiverId, text, sharedPostId } = req.body;

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json("Receiver not found");
    }

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.members.includes(senderId)) {
      return res.status(403).json("Not part of this chat");
    }

    const newMessage = new Message({
      chatId,
      senderId,
      receiverId,
      text: text || "",
      sharedPostId: sharedPostId || null
    });

    const savedMessage = await newMessage.save();

    // Notification
    await Notification.create({
      senderId,
      receiverId,
      type: "message"
    });

    res.status(200).json(savedMessage);

  } catch (err) {
    res.status(500).json(err);
  }
});
/*
========================================
3. GET ALL MESSAGES OF CHAT
========================================
*/router.get("/message/:chatId", verifyToken, validateObjectId("chatId"), async (req, res) => {
  try {
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(req.params.chatId)) {
      return res.status(400).json("Invalid Chat ID");
    }
    const userId = req.user.id;

    const chat = await Chat.findById(req.params.chatId);

    if (!chat || !chat.members.includes(userId)) {
      return res.status(403).json("Access denied");
    }

    const messages = await Message.find({
      chatId: req.params.chatId
    }).populate("sharedPostId");

    res.status(200).json(messages);

  } catch (err) {
    res.status(500).json(err);
  }
});
/*
========================================
4. GET USER CHATS
========================================
*/
router.get("/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({
      members: { $in: [req.params.userId] }
    });

    // Populate each member's user info
    const populated = await Promise.all(
      chats.map(async (chat) => {
        const memberDetails = await Promise.all(
          chat.members.map(id =>
            User.findById(id).select("_id name bio profilePic").lean()
          )
        );
        return { ...chat.toObject(), memberDetails };
      })
    );

    res.status(200).json(populated);

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;