import type { Server as SocketIOServer } from 'socket.io';

declare global {
  var ioServerInstance: SocketIOServer | undefined;
}

export const getIoInstance = (): SocketIOServer | undefined => {
  return global.ioServerInstance;
};

export const VOTE_UPDATE_EVENT = 'VOTE_UPDATE_EVENT';
