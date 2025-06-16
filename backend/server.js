// backend/server.js
require('dotenv').config({ path: './backend/.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const authRoutes = require('./routes/auth.js');

const app = express();
app.use(cors());
app.use(express.json());

//const MONGO1 = "mongodb+srv://gio3vannigaudius0:Giovanni-25@websitegame.qp0jtug.mongodb.net/?retryWrites=true&w=majority&appName=WebSiteGame";

console.log("🌍 MONGO_URI:", process.env.MONGO_URI );
//console.log("🌍 MONGO_URI:",  MONGO1 );
mongoose.connect(process.env.MONGO_URI/*|| MONGO1*/ )
    .then(() => console.log("✅ Connessione a MongoDB riuscita"))
    .catch((err) => console.error("❌ Errore di connessione MongoDB:", err));

app.use('/api/auth', authRoutes);

// 3️⃣ Avvio del server
app.listen(3000, () => {
    console.log('Server avviato sulla porta 3000');
});