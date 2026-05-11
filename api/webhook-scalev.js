// api/webhook-scalev.js
// Vercel Serverless Function
// Menerima webhook dari Scalev saat Payment Received
// lalu invite user ke Supabase secara otomatis

const crypto = require('crypto');

export default async function handler(req, res) {
  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ── 1. Verifikasi signature dari Scalev ──────────────────────────────────
    const signingSecret = process.env.SCALEV_SIGNING_SECRET;
    const signature = req.headers['x-scalev-signature'] || req.headers['x-signature'] || '';
    const body = JSON.stringify(req.body);

    if (signingSecret && signature) {
      const expectedSig = crypto
        .createHmac('sha256', signingSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSig && `sha256=${expectedSig}` !== signature) {
        console.warn('Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // ── 2. Ambil data dari payload Scalev ────────────────────────────────────
    const payload = req.body;
    console.log('Scalev webhook received:', JSON.stringify(payload, null, 2));

    // Cari email dari berbagai kemungkinan field di payload Scalev
    const email =
      payload?.customer?.email ||
      payload?.order?.customer?.email ||
      payload?.email ||
      payload?.buyer_email ||
      null;

    if (!email) {
      console.error('No email found in payload:', payload);
      return res.status(400).json({ error: 'Email not found in payload' });
    }

    console.log('Inviting user:', email);

    // ── 3. Invite user via Supabase Admin API ────────────────────────────────
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(`${supabaseUrl}/auth/v1/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
      body: JSON.stringify({
        email: email,
        data: {
          source: 'scalev',
          order_id: payload?.id || payload?.order?.id || '',
        },
      }),
    });

    const result = await response.json();
    console.log('Supabase invite result:', result);

    if (!response.ok) {
      // Kalau user sudah ada, bukan error — anggap sukses
      if (result?.msg?.includes('already been registered') || result?.code === 'email_exists') {
        console.log('User already exists:', email);
        return res.status(200).json({ success: true, message: 'User already exists' });
      }
      console.error('Supabase invite error:', result);
      return res.status(500).json({ error: 'Failed to invite user', detail: result });
    }

    return res.status(200).json({ success: true, email });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}// api/webhook-scalev.js
// Vercel Serverless Function
// Menerima webhook dari Scalev saat Payment Received
// lalu invite user ke Supabase secara otomatis

const crypto = require('crypto');

export default async function handler(req, res) {
  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ── 1. Verifikasi signature dari Scalev ──────────────────────────────────
    const signingSecret = process.env.SCALEV_SIGNING_SECRET;
    const signature = req.headers['x-scalev-signature'] || req.headers['x-signature'] || '';
    const body = JSON.stringify(req.body);

    if (signingSecret && signature) {
      const expectedSig = crypto
        .createHmac('sha256', signingSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSig && `sha256=${expectedSig}` !== signature) {
        console.warn('Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // ── 2. Ambil data dari payload Scalev ────────────────────────────────────
    const payload = req.body;
    console.log('Scalev webhook received:', JSON.stringify(payload, null, 2));

    // Cari email dari berbagai kemungkinan field di payload Scalev
    const email =
      payload?.customer?.email ||
      payload?.order?.customer?.email ||
      payload?.email ||
      payload?.buyer_email ||
      null;

    if (!email) {
      console.error('No email found in payload:', payload);
      return res.status(400).json({ error: 'Email not found in payload' });
    }

    console.log('Inviting user:', email);

    // ── 3. Invite user via Supabase Admin API ────────────────────────────────
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(`${supabaseUrl}/auth/v1/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
      body: JSON.stringify({
        email: email,
        data: {
          source: 'scalev',
          order_id: payload?.id || payload?.order?.id || '',
        },
      }),
    });

    const result = await response.json();
    console.log('Supabase invite result:', result);

    if (!response.ok) {
      // Kalau user sudah ada, bukan error — anggap sukses
      if (result?.msg?.includes('already been registered') || result?.code === 'email_exists') {
        console.log('User already exists:', email);
        return res.status(200).json({ success: true, message: 'User already exists' });
      }
      console.error('Supabase invite error:', result);
      return res.status(500).json({ error: 'Failed to invite user', detail: result });
    }

    return res.status(200).json({ success: true, email });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}