import { Server as SocketIOServer } from 'socket.io'

declare global {
  // eslint-disable-next-line no-var
  var io: SocketIOServer | undefined
}

/**
 * Emit a real-time notification to a specific user's room.
 */
export function emitToUser(userId: string, event: string, data: unknown) {
  if (global.io) {
    global.io.to(`user:${userId}`).emit(event, data)
  }
}
