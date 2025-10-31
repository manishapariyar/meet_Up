
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
    socket.on("join-call", (path) => {
      if (!connections[path]) {
        connections[path] = [];
      }
      connections[path].push(socket.id);
      timeOnline[socket.id] = Date.now();
      // Notify existing users in the room about the new user
      // for (let a = 0; a < connections[path].length; a++) {
      //   io.to(connections[path][a]).emit("user-joined", socket.id);
      // }
      connections[path].forEach(id => {
        io.to(id).emit("user-joined", socket.id);
      });

      // Send existing messages to the newly joined user
      //   if (connections[path] !== undefined) {
      //     for (let a = 0; a < messages[path].length; ++a) {
      //       io.to(socket.id).emit("chat-message", messages[path][a]['data'], messages[path][a]['sender'], messages[path][a]['socket-id-sender']);

      //     }
      //   }
      if (messages[path]) {
        messages[path].forEach(msg => {
          io.to(socket.id).emit("chat-message", msg['data'], msg['sender'], msg['socket-id-sender']);
        })
      }

    })


    // Signaling for WebRTC (peers to peers connection)
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    })

    // Chat message handling
    socket.on("chat-message", (data, sender) => {
      // Find the room the sender belongs to

      const [matchingRoom, found] = Object.entries(connections).reduce(([room, isFound], [roomkey, roomvalue]) => {
        if (!isFound && roomvalue.includes(socket.id)) {
          return [roomkey, true];
        }
        return [room, isFound];

      }, ['', false]);

      if (found) {
        // Initialize message array for the room if it doesn't exist
        if (!messages[matchingRoom]) {
          messages[matchingRoom] = [];
        }
      }
      messages[matchingRoom].push({
        'sender': sender,
        'data': data,
        'socket-id-sender': socket.id
      });
      console.log("message received at server:", data, "from:", sender)

      // Broadcast the message to all users in the room
      connections[matchingRoom].forEach(socketId => {
        io.to(socketId).emit("chat-message", data, sender, socket.id);
      });
    }
    )

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