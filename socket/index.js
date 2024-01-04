const io = require("socket.io")(8800, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  // Add new user
  socket.on("new-user-add", (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("New User Connected", activeUsers);
    }
    io.emit("get-users", activeUsers);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);
    io.emit("get-users", activeUsers);
  });

  // Handle sending message
  socket.on("send-message", (data) => {
    const { senderId, receiverId, message } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);

    if (user) {
      // Send message to the receiver
      io.to(user.socketId).emit("receive-message", data);

      // Emit a notification to the receiver
      io.to(user.socketId).emit("new-message-notification", {
        senderId: senderId,
        message: "You have a new message"
      });
      console.log("Notification emitted to: ", user.socketId);
    }
  });
});
