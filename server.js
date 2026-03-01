const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));

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
        const token = jwt.sign(
            { uid: user.uid, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const expiryTime = new Date(Date.now() + 3600000).toLocaleTimeString();
        await pool.execute('INSERT INTO UserToken (token, uid, expairy) VALUES (?, ?, ?)', [token, user.uid, expiryTime]);

        res.cookie('jwtToken', token, { 
            httpOnly: true, 
            secure: false, 
            sameSite: 'lax',
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
    // --- DEPLOYMENT: Serve React Frontend ---
// This tells Express to serve the static files React builds
app.use(express.static(path.join(__dirname, 'kodbank-frontend', 'dist')));

// For any route not caught by our API, hand it over to React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'kodbank-frontend', 'dist', 'index.html'));
});
app.use(express.static(path.join(__dirname, 'kodbank-frontend', 'dist')));

// For any route not caught by our API, hand it over to React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'kodbank-frontend', 'dist', 'index.html'));
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));