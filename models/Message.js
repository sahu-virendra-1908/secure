const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  messageType: {
    type: String,
    enum: ["text", "voice"],
    default: "text"
  },

  encryptedMessage: String,
  encryptedAESKey: String,
  iv: String,

  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", messageSchema);