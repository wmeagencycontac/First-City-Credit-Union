const express = require('express');
const axios = require('axios');

module.exports = () => {
  const router = express.Router();

  // GET /api/content
  router.get('/content', async (req, res) => {
    try {
      const response = await axios.get('https://www.firstcitycu.org/wp-json/wp/v2/pages');
      res.json(response.data);
    } catch (err) {
      res.status(502).json({ error: 'Content fetch failed', details: err.message });
    }
  });

  return router;
};
