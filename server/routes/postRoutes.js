const router = require("express").Router();
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken");
const validateObjectId = require("../middleware/validateObjectId");

router.post("/create", verifyToken, async (req, res) => {
  try {
    const newPost = new Post({
      ...req.body,
      userId: req.user.id // Always trust the authenticated token over the request body
    });
    const savedPost = await newPost.save();
    
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip  = (page - 1) * limit;

    const posts = await Post.find()
      .populate("userId", "name bio profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      posts
    });

  } catch (err) {
    res.status(500).json(err);
  }
});


router.put("/like/:id", verifyToken, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const userId = req.user.id;
    const post = await Post.findById(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json("Invalid Post ID");
    }
    if (!post) {
      return res.status(404).json("Post not found");
    }

    if (!post.likes.includes(userId)) {
      await post.updateOne({
        $push: { likes: userId }
      });

      if (post.userId.toString() !== userId) {
        await Notification.create({
          senderId: userId,
          receiverId: post.userId,
          type: "like",
          postId: post._id
        });
      }

      res.status(200).json("Post liked");

    } else {
      await post.updateOne({
        $pull: { likes: userId }
      });

      res.status(200).json("Post unliked");
    }

  } catch (err) {
    res.status(500).json(err);
  }
});
router.put("/comment/:id", verifyToken, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const userId = req.user.id;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json("Invalid Post ID");
    }

    if (!text || text.trim() === "") {
      return res.status(400).json("Comment cannot be empty");
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json("Post not found");
    }

    const comment = {
      userId,
      text
    };

    post.comments.push(comment);
    await post.save();

    if (post.userId.toString() !== userId) {
      await Notification.create({
        senderId: userId,
        receiverId: post.userId,
        type: "comment",
        postId: post._id
      });
    }

    res.status(200).json("Comment added");

  } catch (err) {
    res.status(500).json(err);
  }
});
router.put("/:id", verifyToken, validateObjectId("id"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json("Post not found");
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json("Unauthorized");
    }

    post.caption = req.body.caption !== undefined ? req.body.caption : post.caption;
    post.image = req.body.image !== undefined ? req.body.image : post.image;
    
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);

  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", verifyToken, validateObjectId("id"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json("Post not found");
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json("Unauthorized");
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json("Post deleted successfully");

  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/share/:id", async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id);

    if (!originalPost) {
      return res.status(404).json("Original post not found");
    }

    const sharedPost = new Post({
      userId: req.body.userId,
      caption: originalPost.caption,
      image: originalPost.image,
      isShared: true,
      originalPostId: originalPost._id,
      originalUserId: originalPost.userId
    });

    const savedSharedPost = await sharedPost.save();
    await Notification.create({
      senderId: req.body.userId,
      receiverId: originalPost.userId,
      type: "share",
      postId: originalPost._id
    });

    res.status(201).json(savedSharedPost);

  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/user/:userId", verifyToken, validateObjectId("userId"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const posts = await Post.find({
      userId: req.params.userId
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(posts);

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;