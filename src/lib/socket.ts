import { io } from "socket.io-client";
import { API_BASE_URL } from "./config";

// Behind proxy, forcing websocket can sometimes be more stable, 
// but allowing polling as fallback is standard.
export const socket = io(API_BASE_URL, {
  transports: ["polling", "websocket"],
  reconnectionAttempts: 5,
  timeout: 10000,
});

socket.on("connect_error", (err) => {
  console.warn("Socket connection error, retrying...", err.message);
});
