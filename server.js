const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path'); // Added for serving React
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Database Connection Pool (TiDB Serverless)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

// --- API ROUTES ---

// 1. Registration Route
app.post('/register', async (req, res) => {
    const { username, email, password, phone } = req.body;
    try {
        const query = `INSERT INTO KodUser (username, email, password, phone, role) VALUES (?, ?, ?, ?, 'Customer')`;
        await pool.execute(query, [username, email, password, phone]);
        res.status(201).json({ message: "Registration successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Registration failed", details: error.message });
    }
});

// 2. Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await pool.execute('SELECT * FROM KodUser WHERE username = ? AND password = ?', [username, password]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = users[0];
        
        // Generate Token
        const token = jwt.sign(
            { uid: user.uid, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const expiryTime = new Date(Date.now() + 3600000).toLocaleTimeString();
        await pool.execute('INSERT INTO UserToken (token, uid, expairy) VALUES (?, ?, ?)', [token, user.uid, expiryTime]);

        // Simplified Cookie Settings (Since frontend and backend are now together)
        res.cookie('jwtToken', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', // Automatically true when deployed on Render
            maxAge: 3600000 
        });

        res.status(200).json({ message: "Login successful", username: user.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Login failed" });
    }
});

// 3. Verification Middleware
const verifyToken = (req, res, next) => {
    const token = req.cookies.jwtToken;
    if (!token) return res.status(403).json({ message: "No token provided, authorization denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

// 4. Check Balance Route
app.get('/getBalance', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT balance FROM KodUser WHERE username = ?', [req.user.username]);
        if (rows.length > 0) {
            res.status(200).json({ balance: rows[0].balance });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch balance" });
    }
});

// --- FRONTEND INTEGRATION ---

// Serve the static files built by React
app.use(express.static(path.join(__dirname, 'kodbank-frontend', 'dist')));

// Catch-all route: If the user goes to any path not defined above (like /dashboard), send them the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'kodbank-frontend', 'dist', 'index.html'));
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Fullstack server running on port ${PORT}`));
