const crypto = require('node:crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    console.error('IMAGEKIT_PRIVATE_KEY is missing');
    return res.status(500).json({
      error: 'ImageKit private key is not configured.'
    });
  }

  try {
    const token = crypto.randomUUID();

    // Less than 1 hour, as required by ImageKit
    const expire = Math.floor(Date.now() / 1000) + 30 * 60;

    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(token + expire)
      .digest('hex');

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');

    return res.status(200).json({
      token,
      expire,
      signature
    });

  } catch (error) {
    console.error('ImageKit auth:', error);

    return res.status(500).json({
      error: 'Could not prepare ImageKit upload.'
    });
  }
};