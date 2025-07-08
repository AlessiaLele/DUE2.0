// backend/server.js
require('dotenv').config({ path: './backend/.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const lobbyRoutes = require('./routes/lobby');
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());

console.log("🌍 MONGO_URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connessione a MongoDB riuscita"))
    .catch((err) => console.error("❌ Errore di connessione MongoDB:", err));

app.use('/api/lobby', lobbyRoutes);
app.use('/api/auth', authRoutes);

// 3️⃣ Avvio del server
app.listen(3002, () => {
    console.log('Server avviato sulla porta 3002');
});