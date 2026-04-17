const router = require("express").Router();
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken");

// GET USER NOTIFICATIONS
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiverId: req.user.id
    })
      .populate("senderId", "name profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);

  } catch (err) {
    res.status(500).json(err);
  }
});

// MARK AS READ
router.put("/read/:id", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json("Notification not found");
    }

    if (notification.receiverId.toString() !== req.user.id) {
      return res.status(403).json("Unauthorized");
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json("Notification marked as read");

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;