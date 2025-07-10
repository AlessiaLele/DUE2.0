const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    players: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lobby', lobbySchema);
