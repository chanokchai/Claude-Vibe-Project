import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import choresRouter from './routes/chores';
import membersRouter from './routes/members';
import completionsRouter from './routes/completions';

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/chores', choresRouter);
app.use('/api/members', membersRouter);
app.use('/api/completions', completionsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
