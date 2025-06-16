import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
}

declare global {
  var ioServerInstance: SocketIOServer | undefined;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (req.method === 'GET') {
    if (!res.socket.server.io) {
      console.log('Socket.IO server initializing...');
      const httpServer = res.socket.server;
      const io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
      });

      io.on('error', (err) => {
        console.error('Socket.IO Server Instance Error:', err);
      });

      io.on('connection', (socket) => {
        console.log(`Socket.IO: Client connected: ${socket.id}`);
        
        socket.on('disconnect', (reason) => {
          console.log(`Socket.IO: Client disconnected: ${socket.id}, reason: ${reason}`);
        });

        socket.on('error', (err) => {
          console.error(`Socket.IO: Error on socket ${socket.id}:`, err);
        });
      });

      res.socket.server.io = io;
      global.ioServerInstance = io;
      console.log('Socket.IO server initialized and attached.');
    } else {
      console.log('Socket.IO server already running.');
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
  res.end();
};

export default SocketHandler;
