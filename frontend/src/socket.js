import { io } from "socket.io-client";

// ✅ Your deployed backend URL
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;


const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Connection status logging
socket.on("connect", () => {
  console.log("✅ Connected to server with ID:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected from server:", reason);
});

socket.on("connect_error", (error) => {
  console.error("⚠️ Connection error:", error);
});

export default socket;
