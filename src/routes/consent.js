const express = require('express');
const { body, validationResult } = require('express-validator');

module.exports = (pool) => {
  const router = express.Router();

  // POST /api/consent
  router.post('/consent', [
    body('user_id').isInt(),
    body('consent').isBoolean()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { user_id, consent } = req.body;
    try {
      await pool.query('INSERT INTO consent (user_id, consent, created_at) VALUES ($1, $2, NOW())', [user_id, consent]);
      res.status(201).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
