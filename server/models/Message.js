const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  text: {
    type: String,
    default: ""
  },

  sharedPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);