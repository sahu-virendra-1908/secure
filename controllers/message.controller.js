const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  try {

    const {
      messageType,
      encryptedMessage,
      encryptedAESKey,
      iv,
      ttl
    } = req.body;

    let expiresAt = null;

    if (ttl && ttl > 0) {
      expiresAt = new Date(Date.now() + ttl * 1000);
    }

    const message = await Message.create({
      senderId: req.user.id,
      messageType,
      encryptedMessage,
      encryptedAESKey,
      iv,
      expiresAt
    });

    res.json({
      success: true,
      message
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};


exports.getMessages = async (req, res) => {

  try {

    const messages = await Message.find()
      .populate("senderId", "email")
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

};