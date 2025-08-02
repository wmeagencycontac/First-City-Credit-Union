require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

const authRoutes = require('./routes/auth');
const loanRoutes = require('./routes/loans');
const contentRoutes = require('./routes/content');
const consentRoutes = require('./routes/consent');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(csurf({ cookie: true }));

// Health check to prevent sleep
app.get('/api/ping', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api', authRoutes(pool));
app.use('/api', loanRoutes(pool));
app.use('/api', contentRoutes());
app.use('/api', consentRoutes(pool));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
