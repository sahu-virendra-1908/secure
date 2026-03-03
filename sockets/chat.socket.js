const { verifyToken } = require("../config/jwt");

module.exports = (io) => {

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token;

      if (!token) return next(new Error("Authentication error"));

      const decoded = verifyToken(token);
      socket.userId = decoded.id;

      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    // 🔹 Join Private Room
    socket.on("join_room", ({ otherUserId }) => {
      const roomId = [socket.userId, otherUserId]
        .sort()
        .join("_");

      socket.join(roomId);

      console.log(`User ${socket.userId} joined room ${roomId}`);
    });

    // 🔹 Send Message To Room
    socket.on("send_message", (data) => {
      const { otherUserId } = data;

      const roomId = [socket.userId, otherUserId]
        .sort()
        .join("_");

      io.to(roomId).emit("receive_message", {
        senderId: socket.userId,
        encryptedMessage: data.encryptedMessage,
        encryptedAESKey: data.encryptedAESKey,
        ttl: data.ttl,
        messageId: data.messageId,
        timestamp: data.timestamp,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
};