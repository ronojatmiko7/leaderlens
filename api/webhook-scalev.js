const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const payload = req.body;
    console.log('Webhook received:', JSON.stringify(payload));

    const email =
      payload?.customer?.email ||
      payload?.order?.customer?.email ||
      payload?.email ||
      payload?.buyer_email ||
      null;

    if (!email) {
      return res.status(400).json({ error: 'Email not found in payload' });
    }

    console.log('Inviting:', email);

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: 'Missing env vars' });
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
      body: JSON.stringify({ email, data: { source: 'scalev' } }),
    });

    const result = await response.json();
    console.log('Supabase result:', response.status, JSON.stringify(result));

    if (!response.ok) {
      const msg = result?.msg || result?.message || '';
      if (msg.includes('already') || result?.code === 'email_exists') {
        return res.status(200).json({ success: true, message: 'User already exists' });
      }
      return res.status(500).json({ error: 'Failed to invite', detail: result });
    }

    return res.status(200).json({ success: true, email });

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
