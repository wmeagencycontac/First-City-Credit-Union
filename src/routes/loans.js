const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
  const router = express.Router();

  // POST /api/loans/apply
  router.post('/loans/apply', [
    body('loanData').isObject()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const response = await axios.post('https://app.loanspq.com/api/apply', req.body.loanData, {
        headers: { 'x-api-key': process.env.LOANSPQ_API_KEY }
      });
      res.json(response.data);
    } catch (err) {
      res.status(502).json({ error: 'Loan application failed', details: err.message });
    }
  });

  // GET /api/loans/status
  router.get('/loans/status', async (req, res) => {
    try {
      const response = await axios.get('https://api.meridianlink.com/loans/status', {
        headers: { 'x-api-key': process.env.MERIDIANLINK_API_KEY }
      });
      res.json(response.data);
    } catch (err) {
      res.status(502).json({ error: 'Status fetch failed', details: err.message });
    }
  });

  return router;
};
