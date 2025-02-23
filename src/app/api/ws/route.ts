import { prisma } from '@/lib/prisma'

export const config = {
  runtime: 'edge',
  regions: ['iad1']  // Washington DC
};

// use a Map to store connections and their associated data
const connections = new Map<string, WebSocket>();

interface WebSocketPair {
  0: WebSocket;
  1: WebSocket;
}

declare const WebSocketPair: {
  new(): WebSocketPair;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId') || crypto.randomUUID();

  const upgradeHeader = req.headers.get('upgrade');
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected Upgrade: WebSocket', { status: 426 });
  }

  try {
    const { 0: client, 1: server } = new WebSocketPair();
    const response = new Response(null, {
      status: 101,
    });
    (response as Response & { webSocket: WebSocket }).webSocket = client;
    const socket = server;

    socket.onopen = () => {
      connections.set(clientId, socket);
      console.log(`Client connected: ${clientId}`);
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'place-pixel') {
        await prisma.pixel.upsert({
          where: { x_y: { x: message.x, y: message.y } },
          update: { color: message.color },
          create: { x: message.x, y: message.y, color: message.color, userId: '1' }
        });

        // Broadcast to other clients
        connections.forEach((client, id) => {
          if (id !== clientId && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      }
    };

    socket.onclose = () => {
      connections.delete(clientId);
      console.log(`Client disconnected: ${clientId}`);
    };

    return response;
  } catch (err) {
    console.error('WebSocket upgrade failed:', err);
    return new Response('WebSocket upgrade failed', { status: 500 });
  }
} 
