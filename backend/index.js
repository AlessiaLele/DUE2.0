const cors = require('cors');

// Configura CORS direttamente
app.use(cors({
    origin: 'http://localhost:3000', // Dove gira il frontend
    credentials: true
}));

module.exports = cors(corsOptions);

// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

// In-memory user storage
const users = [];

// Configura CORS direttamente
app.use(cors({
    origin: 'http://localhost:3004', // Cambiato per riflettere la tua porta frontend reale
    credentials: true
}));

app.use(bodyParser.json());

// REGISTER
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    if (users.find(user => user.email === email)) {
        return res.status(400).json({ error: 'Email già registrata' });
    }

    const newUser = { username, email, password };
    users.push(newUser);
    res.json({ message: 'Registrazione completata', user: newUser });
});

// LOGIN
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Credenziali non valide' });
    }

    res.json({ message: 'Login riuscito', user });
});

app.listen(port, () => {
    console.log(`✅ Server in ascolto su http://localhost:${port}`);
});