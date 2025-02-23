import { prisma } from '@/lib/prisma';
import { WebSocket } from '@edge-runtime/primitives';
// import { WebSocketPair } from '@edge-runtime/primitives';

export const config = {
  runtime: 'edge',
  regions: ['iad1']
};

// Store connections in a global Map
const connections = new Map<string, WebSocket>();

export async function GET(req: Request) {
  const upgradeHeader = req.headers.get('upgrade');
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected Upgrade: WebSocket', { status: 426 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId') || crypto.randomUUID();

  try {
    const server = new WebSocket(req.url);
    connections.set(clientId, server);

    server.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'place-pixel') {
          await prisma.pixel.upsert({
            where: { x_y: { x: message.x, y: message.y } },
            update: { color: message.color },
            create: { x: message.x, y: message.y, color: message.color, userId: '1' }
          });

          // Broadcast to other clients
          connections.forEach((conn, id) => {
            if (id !== clientId && conn.readyState === WebSocket.OPEN) {
              conn.send(JSON.stringify(message));
            }
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    server.addEventListener('close', () => {
      connections.delete(clientId);
      console.log(`Client disconnected: ${clientId}`);
    });

    return new Response(null, {
      status: 101,
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket'
      }
    });
  } catch (error) {
    console.error('WebSocket connection error:', error);
    return new Response('WebSocket connection failed', { status: 500 });
  }
} 
