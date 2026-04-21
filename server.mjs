// @ts-check
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    path: '/api/socketio',
  })

  // Store io globally so API routes can access it
  global.io = io

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id)

    // Join user's personal room for targeted notifications
    socket.on('join-room', (userId) => {
      socket.join(`user:${userId}`)
      console.log(`Socket ${socket.id} joined room user:${userId}`)
    })

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`\n🚀 MellyOS ready on http://${hostname}:${port}`)
      console.log(`   Mode: ${dev ? 'development' : 'production'}\n`)
    })
})
