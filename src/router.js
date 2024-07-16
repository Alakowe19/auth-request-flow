const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const mockUser = {
    username: 'authguy',
    password: 'mypassword',
    profile: {
        firstName: 'Chris',
        lastName: 'Wolstenholme',
        age: 43
    }
};

// Route: POST /login - Authenticate user and issue JWT token
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if username and password match mockUser
    if (username === mockUser.username && password === mockUser.password) {
        // Issue a JWT token
        const token = jwt.sign({ username: mockUser.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Route: GET /profile - Protected route, requires valid token
router.get('/profile', authenticateToken, (req, res) => {
    // The user is authenticated, send back the profile
    res.json(mockUser.profile);
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401); // If there isn't any token
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // If the token is invalid or expired
        }
        req.user = user; // Store the user information in the request object
        next(); // Pass the execution to the next middleware
    });
}

module.exports = router;

/*
token
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImF1dGhndXkiLCJpYXQiOjE3MjExMjE4MjAsImV4cCI6MTcyMTEyNTQyMH0.wxgRakrq9Z9h7KFQcv4N0CfG6d057QG1ns7jXfowqiQ"
*/
