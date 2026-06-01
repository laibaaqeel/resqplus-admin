import { io } from 'socket.io-client';

const socket = io('https://resqplus-backend-production-89f4.up.railway.app', {
  autoConnect: true,
  reconnection: true,
});

export default socket;