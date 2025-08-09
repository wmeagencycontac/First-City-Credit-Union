const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

module.exports = (pool) => {
  const router = express.Router();

  // POST /api/login
  router.post('/login', authLimiter, [
    body('username').isString().notEmpty(),
    body('password').isString().notEmpty()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, password } = req.body;
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // POST /api/register
  router.post('/register', authLimiter, [
    body('username').isString().notEmpty(),
    body('password').isString().isLength({ min: 6 }),
    body('email').isEmail()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, password, email } = req.body;
    try {
      const hash = await bcrypt.hash(password, 10);
      const { rows } = await pool.query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, email', [username, hash, email]);
      res.status(201).json(rows[0]);
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Username already exists' });
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
