import { Router, Request, Response } from 'express';
import { prisma } from '../server';
import { expandChoresToEvents } from '../lib/recurrence';

const router = Router();

// GET /api/chores/occurrences?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/occurrences', async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query params are required' });
    }

    const rangeStart = new Date(start as string);
    const rangeEnd = new Date(end as string);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const chores = await prisma.chore.findMany({
      include: {
        assignedTo: true,
        completions: {
          where: {
            occurrenceDate: {
              gte: rangeStart,
              lte: rangeEnd,
            },
          },
        },
      },
      where: {
        OR: [
          { endDate: null },
          { endDate: { gte: rangeStart } },
        ],
        startDate: { lte: rangeEnd },
      },
    });

    const events = expandChoresToEvents(chores, rangeStart, rangeEnd, today);
    return res.json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/chores
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, assignedToId, recurrence, recurrenceDays, startDate, endDate } = req.body;

    if (!title || !recurrence || !startDate) {
      return res.status(400).json({ error: 'title, recurrence, and startDate are required' });
    }

    const chore = await prisma.chore.create({
      data: {
        title,
        description: description || null,
        assignedToId: assignedToId || null,
        recurrence,
        recurrenceDays: recurrenceDays ? JSON.stringify(recurrenceDays) : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: { assignedTo: true },
    });

    return res.status(201).json(chore);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/chores/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, assignedToId, recurrence, recurrenceDays, startDate, endDate } = req.body;

    const chore = await prisma.chore.update({
      where: { id },
      data: {
        title,
        description: description || null,
        assignedToId: assignedToId || null,
        recurrence,
        recurrenceDays: recurrenceDays ? JSON.stringify(recurrenceDays) : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: { assignedTo: true },
    });

    return res.json(chore);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/chores/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.completion.deleteMany({ where: { choreId: id } });
    await prisma.chore.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chores/:id/history
router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const completions = await prisma.completion.findMany({
      where: { choreId: id },
      orderBy: { occurrenceDate: 'desc' },
    });
    return res.json(completions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
