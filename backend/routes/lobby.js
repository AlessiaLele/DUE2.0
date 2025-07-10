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

module.exports = router;
