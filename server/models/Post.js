const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  caption: {
    type: String,
    default: ""
  },

  image: {
    type: String,
    default: ""
  },

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    text: String
  }],

  isShared: {
    type: Boolean,
    default: false
  },

  originalPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null
  },

  originalUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);