require('dotenv').config();
const express  = require('express');
const http     = require('http');
const mongoose = require('mongoose');
const cors     = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes  = require('./routes/auth');
const app    = express();
const server = http.createServer(app);



const corsOptions = {
    origin: "http://localhost:3001",
    credentials: true               // fondamentale per invio cookie
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', authRoutes);



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


const PORT = process.env.PORT || 3000;
server.listen(PORT,'0.0.0.0', () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});

