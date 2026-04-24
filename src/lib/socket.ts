import { io } from "socket.io-client";

// Behind proxy, forcing websocket can sometimes be more stable, 
// but allowing polling as fallback is standard.
export const socket = io(window.location.origin, {
  transports: ["polling", "websocket"],
  reconnectionAttempts: 5,
  timeout: 10000,
});

socket.on("connect_error", (err) => {
  console.warn("Socket connection error, retrying...", err.message);
});
