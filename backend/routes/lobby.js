const express = require('express');
const Lobby = require('../models/Lobby');
const User = require('../models/User');
const router = express.Router();

// Crea una nuova lobby
router.post('/create', async (req, res) => {
    const { name, userId } = req.body;

    try {
        const exists = await Lobby.findOne({ name });
        if (exists) return res.status(400).json({ msg: 'Lobby già esistente' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'Utente non trovato' });

        const lobby = new Lobby({
            name,
            players: [{ userId, username: user.username }]
        });

        await lobby.save();
        res.status(201).json({ msg: 'Lobby creata', lobby });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Errore del server' });
    }
});

// Unisciti a una lobby tramite link/nome
router.post('/join', async (req, res) => {
    const { name, userId } = req.body;

    try {
        const lobby = await Lobby.findOne({ name });
        if (!lobby) return res.status(404).json({ msg: 'Lobby non trovata' });

        const alreadyJoined = lobby.players.find(p => p.userId.toString() === userId);
        if (alreadyJoined) {
            return res.status(200).json({ msg: 'Già unito', lobby });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'Utente non trovato' });

        lobby.players.push({ userId, username: user.username });
        await lobby.save();

        res.status(200).json({ msg: 'Unito alla lobby', lobby });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Errore del server' });
    }
});

// Recupera stato lobby
router.get('/:name', async (req, res) => {
    try {
        const lobby = await Lobby.findOne({ name: req.params.name });
        if (!lobby) return res.status(404).json({ msg: 'Lobby non trovata' });

        res.status(200).json({ lobby });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Errore del server' });
    }
});

module.exports = router;
