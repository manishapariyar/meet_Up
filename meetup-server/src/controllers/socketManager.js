
import { Server } from "socket.io";


let connections = {};
let messages = {};
let timeOnline = {};




const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.REACT_APP_URL,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {

    console.log("New client connected:", socket.id);
    socket.on("join-call", (data) => {
      const { room, userName } = data;
      const path = room;
      if (!path || typeof path !== "string") return;

      if (!connections[path]) connections[path] = [];
      if (!messages[path]) messages[path] = [];

      connections[path].push(socket.id);
      timeOnline[socket.id] = Date.now();
      socket.userName = userName;

      const otherClients = connections[path].filter(id => id !== socket.id);
      console.log(`User ${socket.id} joined room: ${path}`);
      console.log(`Other clients in room:`, otherClients);

      otherClients.forEach(id => {
        io.to(id).emit("user-joined", socket.id, userName);
      });

      io.to(socket.id).emit("user-joined", null, otherClients.map(id => ({
        socketId: id,
        userName: io.sockets.sockets.get(id)?.userName || "Guest"
      })));

      // Send previous messages if any
      messages[path].forEach(msg => {
        io.to(socket.id).emit("chat-message", msg.data, msg.sender, msg["socket-id-sender"]);
      });
    });



    // Signaling for WebRTC (peers to peers connection)
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    })

    // Chat message handling
    socket.on("chat-message", (msg) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        ["", false]
      );

      if (found) {
        if (!messages[matchingRoom]) messages[matchingRoom] = [];

        const message = {
          sender: msg.sender,
          text: msg.text,
          socketId: socket.id,
        };

        messages[matchingRoom].push(message);
        console.log("💬 Message received:", message);

        // Send to all users in the same room (including sender)
        connections[matchingRoom].forEach((socketId) => {
          io.to(socketId).emit("chat-message", message);
        });
      }
    });


    // Handle user disconnection
    socket.on("disconnect", () => {

      const disconnectTime = Date.now();
      const durationOnline = disconnectTime - (timeOnline[socket.id] || disconnectTime);

      //find the room this socket was connected 
      for (const [roomKey, roomValue] of Object.entries(connections)) {
        const index = roomValue.indexOf(socket.id);
        if (index !== -1) {
          // notify other users in the room about the disconnection
          connections[roomKey].forEach(id => {
            io.to(id).emit("user-disconnected", socket.id);
          })
          // remove the socket from the room
          connections[roomKey].splice(index, 1);

          // Cleanup empty room
          if (connections[roomKey].length === 0) {
            delete connections[roomKey];
            delete messages[roomKey]; // Optional: clear messages
          }
          break; // Exit after finding the room

        }

      }
      // Remove socket from timeOnline
      delete timeOnline[socket.id];
      console.log(`Socket ${socket.id} disconnected. Online duration: ${durationOnline}ms`);
    })
  });

  return io;
}

export default connectToSocket;