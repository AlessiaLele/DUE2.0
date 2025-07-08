const mongoose = require('mongoose');

const LobbySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    players: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            username: String
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lobby', LobbySchema);
