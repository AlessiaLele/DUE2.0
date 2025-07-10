const express = require('express');
const Lobby = require('../models/Lobby');
const router = express.Router();

// POST /api/lobby/create
router.post('/create', async (req, res) => {
    const { name, username } = req.body;

    try {
        let lobby = await Lobby.findOne({ name });
        if (lobby) return res.status(400).json({ msg: 'Lobby già esistente' });

        lobby = new Lobby({ name, players: [username] });
        await lobby.save();

        res.status(200).json({ msg: 'Lobby creata', lobby });
    } catch (err) {
        res.status(500).json({ msg: 'Errore server' });
    }
});

// 🔹 GET info lobby
router.get('/:name', async (req, res) => {
    try {
        const lobby = await Lobby.findOne({ name: req.params.name });
        if (!lobby) return res.status(404).json({ msg: 'Lobby non trovata' });
        return res.json({ lobby });
    } catch (err) {
        return res.status(500).json({ msg: 'Errore server' });
    }
});

// 🔹 POST join via HTTP (opzionale)
router.post('/join', async (req, res) => {
    const { name, username } = req.body;
    try {
        const lobby = await Lobby.findOne({ name });
        if (!lobby) return res.status(404).json({ msg: 'Lobby non trovata' });
        if (!lobby.players.includes(username)) {
            lobby.players.push(username);
            await lobby.save();
        }
        return res.json({ msg: 'Partecipazione avvenuta', lobby });
    } catch (err) {
        return res.status(500).json({ msg: 'Errore server' });
    }
});


module.exports = router;
