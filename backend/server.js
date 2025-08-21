// backend/server.js

require('dotenv').config();

const express  = require('express');

const http     = require('http');



const mongoose = require('mongoose');

const cors     = require('cors');

// Routes

const authRoutes  = require('./routes/auth');



const app    = express();

const server = http.createServer(app);



// Middlewares

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Connect to MongoDB

(async function connectDB() {

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

})();

// In-memory state


// Start server

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});

