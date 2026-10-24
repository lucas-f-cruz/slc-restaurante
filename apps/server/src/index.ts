import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { authRouter } from './routes/auth.js';
import { menuRouter } from './routes/menu.js';
import { mesasRouter } from './routes/mesas.js';
import { pedidosRouter } from './routes/pedidos.js';
import { usuariosRouter } from './routes/usuarios.js';
import { configuracoesRouter } from './routes/configuracoes.js';
import { relatoriosRouter } from './routes/relatorios.js';
import { initWebSocketHub } from './ws/hub.js';

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN ?? '').split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json());

app.get('/api/v1/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/v1', authRouter);
app.use('/api/v1', menuRouter);
app.use('/api/v1', mesasRouter);
app.use('/api/v1', pedidosRouter);
app.use('/api/v1', usuariosRouter);
app.use('/api/v1', configuracoesRouter);
app.use('/api/v1', relatoriosRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const httpServer = createServer(app);
initWebSocketHub(httpServer);

const port = Number(process.env.PORT ?? 4000);
httpServer.listen(port, () => {
  console.log(`Sol e Lua Café — API rodando em http://localhost:${port}`);
  console.log(`WebSocket disponível em ws://localhost:${port}/ws`);
});
