import { io } from 'socket.io-client';

const socket = io('https://resqplus-backend-production.up.railway.app', {
  autoConnect: true,
  reconnection: true,
});

export default socket;