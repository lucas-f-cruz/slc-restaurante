import { useEffect, useRef } from 'react';
import type { WsEvent } from '@sol-e-lua/shared';

/**
 * Conecta ao WebSocket do servidor e reconecta automaticamente com backoff exponencial
 * (a rede do restaurante / wifi do cliente é instável — a conexão cai com frequência).
 */
export function useWebSocket(onEvent: (event: WsEvent) => void) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    let socket: WebSocket | null = null;
    let attempt = 0;
    let closedByEffect = false;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    function connect() {
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocol}//${location.host}/ws`);

      socket.onopen = () => { attempt = 0; };
      socket.onmessage = (msg) => {
        try {
          const event = JSON.parse(msg.data) as WsEvent;
          handlerRef.current(event);
        } catch {
          // ignora mensagens malformadas
        }
      };
      socket.onclose = () => {
        if (closedByEffect) return;
        const delay = Math.min(1000 * 2 ** attempt, 15000);
        attempt++;
        retryTimeout = setTimeout(connect, delay);
      };
      socket.onerror = () => socket?.close();
    }

    connect();
    return () => {
      closedByEffect = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      socket?.close();
    };
  }, []);
}
