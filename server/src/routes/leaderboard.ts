import { Router, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/leaderboard?region=kanto — top 10 scores for a region (30s mode)
router.get('/', async (req, res: Response) => {
  const region = req.query.region as string;

  let query = supabase
    .from('leaderboard')
    .select('*')
    .eq('time_limit', 30)
    .order('score', { ascending: false })
    .limit(10);

  if (region) {
    query = query.eq('region', region);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// POST /api/leaderboard — submit a score
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { display_name, region, score, time_limit } = req.body as {
    display_name: string;
    region: string;
    score: number;
    time_limit: number;
  };

  if (!display_name || !region || score == null || !time_limit) {
    res.status(400).json({ error: 'display_name, region, score, and time_limit are required' });
    return;
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .insert({
      user_id: req.userId,
      display_name,
      region,
      score,
      time_limit,
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

export default router;
