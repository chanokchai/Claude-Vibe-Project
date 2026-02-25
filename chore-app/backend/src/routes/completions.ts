import { Router, Request, Response } from 'express';
import { prisma } from '../server';

const router = Router();

// POST /api/completions
router.post('/', async (req: Request, res: Response) => {
  try {
    const { choreId, occurrenceDate, completedBy } = req.body;

    if (!choreId || !occurrenceDate || !completedBy) {
      return res.status(400).json({ error: 'choreId, occurrenceDate, and completedBy are required' });
    }

    // Prevent duplicate completions for the same occurrence
    const existing = await prisma.completion.findFirst({
      where: {
        choreId: parseInt(choreId),
        occurrenceDate: new Date(occurrenceDate),
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'This occurrence is already completed', completion: existing });
    }

    const completion = await prisma.completion.create({
      data: {
        choreId: parseInt(choreId),
        completedBy: completedBy.trim(),
        occurrenceDate: new Date(occurrenceDate),
      },
    });

    return res.status(201).json(completion);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/completions/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.completion.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
