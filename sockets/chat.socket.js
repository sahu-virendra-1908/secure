const { verifyToken } = require("../config/jwt");
const Message = require("../models/Message");

module.exports = (io) => {

  // Socket authentication
  io.use((socket, next) => {
    try {

      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = verifyToken(token);

      socket.userId = decoded.id;

      next();

    } catch (err) {

      next(new Error("Authentication error"));

    }
  });


  io.on("connection", async (socket) => {

    console.log("User connected:", socket.userId);

    // Join global room
    socket.join("GLOBAL_ROOM");


    // Send old messages
    try {

      const messages = await Message.find().sort({ createdAt: 1 });

      messages.forEach((msg) => {

        let ttl = 0;

        if (msg.expiresAt) {
          ttl = Math.max(
            0,
            Math.floor((msg.expiresAt - Date.now()) / 1000)
          );
        }

        socket.emit("receive_message", {

          senderId: msg.senderId,

          messageType: msg.messageType || "text",

          encryptedMessage: msg.encryptedMessage,

          encryptedAESKey: msg.encryptedAESKey,

          iv: msg.iv,

          ttl: ttl,

          messageId: msg._id,

          timestamp: msg.createdAt
        });

      });

    } catch (err) {

      console.error("Error loading old messages:", err);

    }


    // When user sends message
    socket.on("send_message", async (data) => {

      try {

        if (
          !data.encryptedMessage ||
          !data.encryptedAESKey ||
          !data.iv
        ) {
          return;
        }

        const ttlSeconds = data.ttl || 0;

        let expiresAt = null;

        if (ttlSeconds > 0) {

          expiresAt = new Date(
            Date.now() + ttlSeconds * 1000
          );

        }

        const newMessage = await Message.create({

          senderId: socket.userId,

          messageType: data.messageType || "text",

          encryptedMessage: data.encryptedMessage,

          encryptedAESKey: data.encryptedAESKey,

          iv: data.iv,

          expiresAt

        });

        io.to("GLOBAL_ROOM").emit("receive_message", {

          senderId: socket.userId,

          messageType: data.messageType || "text",

          encryptedMessage: data.encryptedMessage,

          encryptedAESKey: data.encryptedAESKey,

          iv: data.iv,

          ttl: ttlSeconds,

          messageId: newMessage._id,

          timestamp: newMessage.createdAt

        });

      } catch (err) {

        console.error("Message error:", err);

      }

    });


    socket.on("disconnect", () => {

      console.log("User disconnected:", socket.userId);

    });

  });

};