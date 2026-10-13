import express from 'express';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT ?? 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

app.get('/api/health', async (_req, res) => {
  if (!supabase) {
    res.status(500).json({ ok: false, error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set' });
    return;
  }
  const { error } = await supabase.rpc('ping');
  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }
  res.json({ ok: true, supabase: 'ok', time: new Date().toISOString() });
});

const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
