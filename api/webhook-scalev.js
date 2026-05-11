const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const payload = req.body;
    console.log('FULL PAYLOAD:', JSON.stringify(payload, null, 2));
    console.log('HEADERS:', JSON.stringify(req.headers, null, 2));
    return res.status(200).json({ received: true, payload });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
