require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const mongoose = require('mongoose');

const cors = require('cors');

// Routes

const authRoutes = require('./routes/auth');

const lobbyRoutes = require('./routes/lobby');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {

    cors: {

        origin: '*',

        methods: ['GET', 'POST']

    }

});

// Middlewares

app.use(cors());

app.use(express.json());

// API routes

app.use('/api/auth', authRoutes);

app.use('/api/lobby', lobbyRoutes);

// MongoDB connection

toConnectDB();

async function toConnectDB() {

    try {

        await mongoose.connect(process.env.MONGO_URI, {

            useNewUrlParser: true,

            useUnifiedTopology: true

        });

        console.log('MongoDB connesso');

    } catch (err) {

        console.error('Errore connessione MongoDB:', err.message);

        process.exit(1);

    }

}

// In-memory lobby state

const lobbies = {};

// Socket.IO

io.on('connection', (socket) => {

    console.log('Nuovo client connesso:', socket.id);

    socket.on('create-lobby', async ({ name, username }) => {

        // Salvo su DB

        const Lobby = require('./models/Lobby');

        try {

            let lobby = await Lobby.findOne({ name });

            if (lobby) return socket.emit('error', { msg: 'Lobby già esistente' });

            lobby = new Lobby({ name, players: [username] });

            await lobby.save();

            // In-memory

            lobbies[name] = new Set([username]);

            socket.join(name);

            socket.emit('lobby-created', { name, players: [username] });

        } catch (err) {

            console.error(err);

            socket.emit('error', { msg: 'Errore creazione lobby' });

        }

    });

    socket.on('join-lobby', async ({ name, username }) => {

        const Lobby = require('./models/Lobby');

        try {

            const lobby = await Lobby.findOne({ name });

            if (!lobby) return socket.emit('error', { msg: 'Lobby non trovata' });

            // DB update

            if (!lobby.players.includes(username)) {

                lobby.players.push(username);

                await lobby.save();

            }

            // In-memory update

            if (!lobbies[name]) lobbies[name] = new Set();

            lobbies[name].add(username);

            socket.join(name);

            // Broadcast update

            const playersArray = Array.from(lobbies[name]);

            io.to(name).emit('lobby-update', { players: playersArray });

        } catch (err) {

            console.error(err);

            socket.emit('error', { msg: 'Errore join lobby' });

        }

    });

    socket.on('disconnect', () => {

        console.log('Client disconnesso:', socket.id);

        // Possibile pulizia in-memory se serve

    });

});

// Avvio server

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(`Server avviato sulla porta ${PORT}`);

});

