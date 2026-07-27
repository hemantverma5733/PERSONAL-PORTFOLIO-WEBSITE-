require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345'; // Use env var in production

// Rate limiting to prevent spam
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many requests from this IP, please try again later.' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (we will intercept marksheet downloads later)
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to the SQLite database.');
        
        // 1. Messages table
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 2. Users table (for admin login)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`, async (err) => {
            if (!err) {
                // Ensure admin user exists and has the correct password
                db.get(`SELECT * FROM users WHERE email = ?`, ['hemantverma@gmail.com'], async (err, row) => {
                    const hashedPassword = await bcrypt.hash('Hemant@2004', 10);
                    if (!row) {
                        db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, ['hemantverma@gmail.com', hashedPassword]);
                        console.log('Default admin user created: hemantverma@gmail.com');
                    } else {
                        // Update password to the newly requested one
                        db.run(`UPDATE users SET password = ? WHERE email = ?`, [hashedPassword, 'hemantverma@gmail.com']);
                        console.log('Admin user password updated to Hemant@2004');
                    }
                });
            }
        });

        // 3. Guestbook table
        db.run(`CREATE TABLE IF NOT EXISTS guestbook (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            message TEXT NOT NULL,
            emoji TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer <token>

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token.' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: 'Authorization header missing.' });
    }
};

// --- ROUTES ---

// 1. Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ success: true, token });
    });
});

// 2. Protected Route Example (For testing)
app.get('/api/protected', authenticateJWT, (req, res) => {
    res.json({ success: true, message: 'You have accessed a protected route!', user: req.user });
});

// 3. Secure Marksheet Access (Protected)
app.get('/api/marksheet/:id', authenticateJWT, (req, res) => {
    const marksheetId = req.params.id;
    let fileName = '';

    if (marksheetId === '1') {
        fileName = '1st_sem_marksheet.pdf';
    } else if (marksheetId === '2') {
        fileName = '2nd_sem_marksheet.png';
    } else {
        return res.status(404).json({ error: 'Marksheet not found.' });
    }

    const filePath = path.join(__dirname, fileName);
    res.sendFile(filePath);
});

// Nodemailer Config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Contact form submission
app.post('/api/contact', contactLimiter, (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields are required.' });

    const sql = 'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)';
    db.run(sql, [name, email, message], async function(err) {
        if (err) return res.status(500).json({ error: 'Failed to save message.' });
        
        try {
            if(process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                // Admin Email
                await transporter.sendMail({
                    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
                    to: 'hemantverma5733@gmail.com',
                    replyTo: email,
                    subject: `New Message from ${name}`,
                    html: `<h2>New Contact</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message}</p>`
                });
                // User Auto-Reply
                await transporter.sendMail({
                    from: `"Hemant Verma" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Thank you for reaching out!',
                    html: `<p>Hello ${name}, thank you for your message. I will reply soon.</p>`
                });
            }
            res.status(201).json({ success: true, id: this.lastID, message: 'Sent successfully!' });
        } catch (emailError) {
            console.error('Email failed:', emailError);
            res.status(201).json({ success: true, warning: 'Saved, but email failed.' });
        }
    });
});

// Protect Messages API
app.get('/api/messages', authenticateJWT, (req, res) => {
    db.all('SELECT * FROM messages ORDER BY timestamp DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: 'Database error.' });
        res.json({ success: true, data: rows });
    });
});

// Guestbook API
app.get('/api/guestbook', (req, res) => {
    db.all('SELECT * FROM guestbook ORDER BY timestamp DESC LIMIT 50', [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: 'Database error.' });
        res.json({ success: true, data: rows });
    });
});

app.post('/api/guestbook', contactLimiter, (req, res) => {
    const { name, message, emoji } = req.body;
    if (!name || !message) return res.status(400).json({ error: 'Name and message are required.' });

    const sql = 'INSERT INTO guestbook (name, message, emoji) VALUES (?, ?, ?)';
    db.run(sql, [name, message, emoji || '👍'], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to save entry.' });
        res.status(201).json({ success: true, id: this.lastID });
    });
});

// Serve the HTML file for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
