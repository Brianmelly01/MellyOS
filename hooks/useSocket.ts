'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useSocket(userId: string) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!userId) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin

    if (!socket) {
      socket = io(socketUrl, {
        path: '/api/socketio',
        transports: ['websocket', 'polling'],
      })
    }

    socket.on('connect', () => {
      setConnected(true)
      socket?.emit('join-room', userId)
    })

    socket.on('disconnect', () => setConnected(false))

    if (socket.connected) {
      socket.emit('join-room', userId)
      setConnected(true)
    }

    return () => {
      // Don't disconnect on unmount — keep persistent connection
    }
  }, [userId])

  return socket
}
