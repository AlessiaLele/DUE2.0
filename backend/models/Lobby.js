const { Schema, model } = require('mongoose');

const lobbySchema = new Schema({

    code:   { type: String, unique: true, index: true },

    host:   { type: String, required: true },

    players:{ type: [String], default: [] },

    status: { type: String, enum: ['waiting', 'ready', 'running', 'ended'], default: 'waiting' }

}, { timestamps: true });

module.exports = model('Lobby', lobbySchema);

