import { Router, Request, Response } from 'express';
import { prisma } from '../server';

const router = Router();

// GET /api/members
router.get('/', async (_req: Request, res: Response) => {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json(members);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/members
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'name is required' });
    }

    const member = await prisma.teamMember.create({
      data: { name: name.trim() },
    });
    return res.status(201).json(member);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/members/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    // Unassign chores from this member instead of deleting them
    await prisma.chore.updateMany({
      where: { assignedToId: id },
      data: { assignedToId: null },
    });
    await prisma.teamMember.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
