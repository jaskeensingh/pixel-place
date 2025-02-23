import { WebSocketServer } from '@vercel/edge'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'

const wsServer = new WebSocketServer({
  path: '/api/ws',
})

wsServer.on('connection', (socket) => {
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId)
  })

  socket.on('place-pixel', async (data: { x: number; y: number; color: string; roomId?: string }) => {
    if (data.roomId) {
      wsServer.to(data.roomId).emit('pixel-update', data)
    } else {
      wsServer.emit('pixel-update', data)
    }

    await prisma.pixel.upsert({
      where: {
        x_y: { x: data.x, y: data.y }
      },
      update: { color: data.color },
      create: {
        x: data.x,
        y: data.y,
        color: data.color,
        userId: '1'
      }
    })
  })
})

export function GET() {
  return wsServer.handleUpgrade()
} 