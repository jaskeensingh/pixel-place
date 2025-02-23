import { Server as SocketIOServer } from 'socket.io'
import type { NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

let io: SocketIOServer

export async function GET() {
  if (!io) {
    // @ts-expect-error server is attached by socket.io
    const server = (global as unknown).server
    io = new SocketIOServer(server)

    io.on('connection', socket => {
      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
      });

      socket.on('place-pixel', async (data: { x: number; y: number; color: string; roomId?: string }) => {
        if (data.roomId) {
          io.to(data.roomId).emit('pixel-update', data);
        } else {
          io.emit('pixel-update', data);
        }
        console.log('Received pixel:', data);
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
        });
        console.log('Emitting update');
      })
    })
  }

  return NextResponse.json({ success: true })
}