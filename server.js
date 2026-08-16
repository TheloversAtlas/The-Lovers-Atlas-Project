require('dotenv').config();

const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many registration attempts. Please try again shortly.' }
});

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function clean(value, max = 200) {
  return String(value || '').trim().slice(0, max);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, databaseConfigured: Boolean(getSupabase()) });
});

app.get('/api/stats', async (_req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.json({ count: 0, configured: false });

  const { count, error } = await supabase
    .from('citizens')
    .select('*', { count: 'exact', head: true });

  if (error) return res.status(500).json({ error: 'Unable to load registry count.' });
  res.json({ count: count || 0, configured: true });
});

app.post('/api/register', registrationLimiter, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({
      error: 'Registry is not connected yet.',
      setupRequired: true
    });
  }

  const name = clean(req.body.name, 100);
  const email = clean(req.body.email, 254).toLowerCase();
  const source = clean(req.body.source, 80) || 'direct';
  const campaign = clean(req.body.campaign, 80) || 'paradise_launch';
  const emailConsent = Boolean(req.body.emailConsent);

  if (name.length < 2) return res.status(400).json({ error: 'Please enter your name.' });
  if (!validEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });

  const payload = {
    name,
    email,
    destination: 'Paradise',
    source,
    campaign,
    email_consent: emailConsent
  };

let { data, error } = await supabase
  .from('citizens')
  .insert(payload)
  .select('id,citizen_number,name,email,destination,founding_citizen,created_at')
  .single();

  // If this email already exists, return the existing Citizen identity instead
  // of creating a duplicate Citizen number.
  if (error && error.code === '23505') {
    const existing = await supabase
      .from('citizens')
      .select('id,citizen_number,name,email,destination,founding_citizen,created_at')
      .eq('email', email)
      .single();

    if (existing.error) {
      return res.status(500).json({ error: 'Unable to retrieve your Citizen record.' });
    }

    data = existing.data;
    error = null;
  }

  if (error) {
    console.error('Supabase registration error:', error.message);
    return res.status(500).json({ error: 'Your entry could not be documented. Please try again.' });
  }

  return res.status(200).json({
    ok: true,
    citizen: data
  });
});

app.use(express.static(publicDir, {
  extensions: ['html'],
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0
}));

app.use((_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`The Lover's Atlas V2 is running on port ${PORT}`);
  if (!getSupabase()) {
    console.log('Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Replit Secrets.');
  }
});
