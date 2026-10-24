import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer } from 'node:http';
import type { WsEvent } from '@sol-e-lua/shared';
import { verifyToken } from '../lib/auth.js';

interface ClientMeta {
  socket: WebSocket;
  authenticated: boolean;
}

const clients = new Set<ClientMeta>();

export function initWebSocketHub(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket, req) => {
    const url = new URL(req.url ?? '', 'http://localhost');
    const token = url.searchParams.get('token');
    let authenticated = false;
    if (token) {
      try {
        verifyToken(token);
        authenticated = true;
      } catch {
        authenticated = false;
      }
    }
    const meta: ClientMeta = { socket, authenticated };
    clients.add(meta);

    socket.on('close', () => clients.delete(meta));
    socket.on('error', () => clients.delete(meta));
  });

  return wss;
}

/**
 * Envia um evento para todos os clientes conectados.
 * Eventos de painel (pedido:novo, mesa:atualizada) só fazem sentido para clientes autenticados,
 * mas produto:disponibilidade e pedido:status também precisam alcançar o cardápio público (sem token).
 */
export function broadcast(event: WsEvent, options: { onlyAuthenticated?: boolean } = {}) {
  const data = JSON.stringify(event);
  for (const client of clients) {
    if (options.onlyAuthenticated && !client.authenticated) continue;
    if (client.socket.readyState === client.socket.OPEN) {
      client.socket.send(data);
    }
  }
}
