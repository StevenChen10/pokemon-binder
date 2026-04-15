import { Router, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/collection — get all cards in the user's collection
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('collection')
    .select('*')
    .eq('user_id', req.userId);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// POST /api/collection — add a card to the collection
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { card_id } = req.body as { card_id: string };

  if (!card_id) {
    res.status(400).json({ error: 'card_id is required' });
    return;
  }

  const { data, error } = await supabase
    .from('collection')
    .upsert({ user_id: req.userId, card_id, quantity: 1 }, { onConflict: 'user_id,card_id' })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

// DELETE /api/collection/:cardId — remove a card from the collection
router.delete('/:cardId', requireAuth, async (req: AuthRequest, res: Response) => {
  const { cardId } = req.params;

  const { error } = await supabase
    .from('collection')
    .delete()
    .eq('user_id', req.userId)
    .eq('card_id', cardId);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(204).send();
});

export default router;
