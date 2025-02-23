import { WebSocket } from 'ws';
import { prisma } from '@/lib/prisma'

export const config = {
  runtime: 'edge',
  regions: ['iad1']  // Washington DC
};

// Keep track of all connected clients
const clients = new Set<WebSocket>();

export async function GET(req: Request) {
  const webSocket = new WebSocket(req.url);
  clients.add(webSocket);

  webSocket.onmessage = (async (event: WebSocket.MessageEvent) => {
    const { data } = event;
    const message = JSON.parse(data.toString());
    if (message.type === 'place-pixel') {
      await prisma.pixel.upsert({
        where: { x_y: { x: message.x, y: message.y } },
        update: { color: message.color },
        create: { x: message.x, y: message.y, color: message.color, userId: '1' }
      });

      // Broadcast to other clients
      clients.forEach(client => {
        if (client !== webSocket && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }

    if (message.type === 'place-pixel') {
      await prisma.pixel.upsert({
        where: { x_y: { x: message.x, y: message.y } },
        update: { color: message.color },
        create: { x: message.x, y: message.y, color: message.color, userId: '1' }
      });

      // Broadcast to other clients
      clients.forEach(client => {
        if (client !== webSocket && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  });

  webSocket.onclose = () => {
    clients.delete(webSocket);
  };

  return new Response(null, { status: 101 });
} 
