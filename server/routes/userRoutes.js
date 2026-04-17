const router = require("express").Router();
const User = require("../models/User");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken");
const validateObjectId = require("../middleware/validateObjectId");

// GET /users/search?q=name  — search users by name (must be before /:id)
router.get("/search", verifyToken, async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(200).json([]);

    const users = await User.find({
      name: { $regex: q, $options: "i" },
      _id: { $ne: req.user.id }          // exclude self
    })
      .select("_id name bio profilePic followers following")
      .limit(15);

    const result = users.map(u => ({
      _id:            u._id,
      name:           u.name,
      bio:            u.bio,
      profilePic:     u.profilePic,
      followersCount: u.followers.length,
      followingCount: u.following.length
    }));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/darkmode/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json("Unauthorized access");
    }
    const user = await User.findById(req.params.id);
    user.darkMode = !user.darkMode;
    await user.save();

    res.status(200).json({
      message: "Dark mode updated",
      darkMode: user.darkMode
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json("Unauthorized access");
    }
    const user = await User.findById(req.params.id);

    res.status(200).json({
      name: user.name,
      email: user.email,
      darkMode: user.darkMode
    });
  } catch (err) {
    res.status(500).json(err);
  }
});
router.put("/follow/:id", verifyToken, validateObjectId("id"), async (req, res) => {
  try {
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json("Invalid User ID");
    }
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json("You cannot follow yourself");
    }

    const userToFollow = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json("User not found");
    }

    if (userToFollow.followers.includes(currentUserId)) {
      return res.status(400).json("Already following this user");
    }

    await userToFollow.updateOne({
      $push: { followers: currentUserId }
    });

    await currentUser.updateOne({
      $push: { following: targetUserId }
    });

    await Notification.create({
      senderId: currentUserId,
      receiverId: targetUserId,
      type: "follow"
    });

    res.status(200).json("User followed successfully");

  } catch (err) {
    res.status(500).json(err);
  }
});
router.put("/unfollow/:id", verifyToken, async (req, res) => {
  try {
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json("Invalid User ID");
    }
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    const userToUnfollow = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json("User not found");
    }

    if (!userToUnfollow.followers.includes(currentUserId)) {
      return res.status(400).json("You are not following this user");
    }

    await userToUnfollow.updateOne({
      $pull: { followers: currentUserId }
    });

    await currentUser.updateOne({
      $pull: { following: targetUserId }
    });

    res.status(200).json("User unfollowed successfully");

  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/edit/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json("Unauthorized access");
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        bio: req.body.bio,
        description: req.body.description,
        profilePic: req.body.profilePic
      },
      { new: true }
    );

    res.status(200).json(updatedUser);

  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/profile/:id", verifyToken, async (req, res) => {
  try {
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json("Invalid User ID");
    }
    const user = await User.findById(req.params.id)
      .populate("followers", "name profilePic")
      .populate("following", "name profilePic");

    res.status(200).json({
      _id: user._id,
      name: user.name,
      ...(req.user.id === req.params.id && { email: user.email }), // Only return email to owner
      bio: user.bio,
      description: user.description,
      profilePic: user.profilePic,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      followers: user.followers,
      following: user.following
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;