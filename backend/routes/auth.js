const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
//const JWT_SECRET1="chiave-segreta-super-sicura";
// REGISTRAZIONE o controller
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: 'Email già registrata' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ msg: 'Registrazione avvenuta con successo' });
    } catch (err) {
        res.status(500).json({ msg: 'Errore del server' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Credenziali non valide' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Credenziali non valide' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET/*|| JWT_SECRET1*/, { expiresIn: '1h' });

        res.json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ msg: 'Errore del server' });
    }
});

module.exports = router;
