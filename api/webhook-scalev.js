const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const payload = req.body;
    console.log('FULL PAYLOAD:', JSON.stringify(payload, null, 2));

    // Test event — abaikan
    if (payload?.event === 'business.test_event') {
      return res.status(200).json({ received: true, message: 'Test event ignored' });
    }

    // Email ada di data object berdasarkan docs Scalev
    const data = payload?.data || {};
    const email =
      data?.customer?.email ||
      data?.buyer?.email ||
      data?.email ||
      payload?.email ||
      null;

    if (!email) {
      console.error('No email found. Full payload:', JSON.stringify(payload));
      return res.status(400).json({ error: 'Email not found in payload' });
    }

    console.log('Inviting:', email);

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
