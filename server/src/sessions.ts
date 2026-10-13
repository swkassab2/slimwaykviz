import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

function sb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export const sessionsRouter = Router();

sessionsRouter.post('/api/sessions', async (req, res) => {
  const db = sb();
  if (!db) { res.status(500).json({ error: 'Supabase not configured' }); return; }
  const { consultant } = req.body;
  if (!consultant || typeof consultant !== 'string') {
    res.status(400).json({ error: 'consultant is required' }); return;
  }
  const { data, error } = await db
    .from('qualify_sessions')
    .insert({ consultant: consultant.trim(), status: 'draft', current_step: 1, answers: {} })
    .select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

sessionsRouter.get('/api/sessions', async (req, res) => {
  const db = sb();
  if (!db) { res.status(500).json({ error: 'Supabase not configured' }); return; }
  let q = db.from('qualify_sessions').select('*').order('created_at', { ascending: false }).limit(200);
  if (req.query.status) q = q.eq('status', req.query.status as string);
  if (req.query.temperature) q = q.eq('temperature', req.query.temperature as string);
  if (req.query.consultant) q = q.ilike('consultant', `%${req.query.consultant}%`);
  if (req.query.from) q = q.gte('created_at', req.query.from as string);
  if (req.query.to) q = q.lte('created_at', (req.query.to as string) + 'T23:59:59');
  const { data, error } = await q;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

sessionsRouter.get('/api/sessions/:id', async (req, res) => {
  const db = sb();
  if (!db) { res.status(500).json({ error: 'Supabase not configured' }); return; }
  const { data, error } = await db.from('qualify_sessions').select('*').eq('id', req.params.id).single();
  if (error) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(data);
});

sessionsRouter.patch('/api/sessions/:id', async (req, res) => {
  const db = sb();
  if (!db) { res.status(500).json({ error: 'Supabase not configured' }); return; }
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (req.body.answers !== undefined) update.answers = req.body.answers;
  if (req.body.current_step !== undefined) update.current_step = req.body.current_step;
  const { data, error } = await db
    .from('qualify_sessions').update(update).eq('id', req.params.id).eq('status', 'draft').select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

sessionsRouter.post('/api/sessions/:id/complete', async (req, res) => {
  const db = sb();
  if (!db) { res.status(500).json({ error: 'Supabase not configured' }); return; }
  const { score, temperature, bmi, weeks_left, sessions_possible, recommendation, summary_text } = req.body;
  const { data, error } = await db
    .from('qualify_sessions')
    .update({ status: 'done', score, temperature, bmi, weeks_left, sessions_possible, recommendation, summary_text,
      completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', req.params.id).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

sessionsRouter.delete('/api/sessions/:id', async (req, res) => {
  const db = sb();
  if (!db) { res.status(500).json({ error: 'Supabase not configured' }); return; }
  const { error } = await db.from('qualify_sessions').delete().eq('id', req.params.id).eq('status', 'draft');
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true });
});
