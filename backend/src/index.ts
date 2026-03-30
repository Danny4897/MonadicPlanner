import express from 'express';
import cors from 'cors';
import { initDb, isDbEmpty } from './db';
import { runSeed } from './seed';
import boardsRouter from './routes/boards';
import columnsRouter from './routes/columns';
import cardsRouter from './routes/cards';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Init DB and auto-seed if empty
initDb();
if (isDbEmpty()) {
  runSeed();
}

// Routes
app.use('/api', boardsRouter);
app.use('/api', columnsRouter);
app.use('/api', cardsRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'MonadicPlanner', port: PORT });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'planner', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`MonadicPlanner backend running on http://localhost:${PORT}`);
});
