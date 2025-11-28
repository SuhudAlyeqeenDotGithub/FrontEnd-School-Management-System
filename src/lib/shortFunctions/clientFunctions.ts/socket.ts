import { io } from "socket.io-client";
import { BASE_API_URL } from "../shortFunctions";

const socket = io(BASE_API_URL, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false,
  reconnection: false
});

export default socket;
