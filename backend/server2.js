import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

// 🔹 connessione Mongo
const MONGO_URI1 = process.env.MONGO_URI;

mongoose.connect(MONGO_URI1, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ Connesso a MongoDB"))
    .catch(err => console.error("❌ Errore connessione MongoDB:", err));

const GameSchema = new mongoose.Schema({
    sessionId: { type: String, unique: true },
    state: Object,
});
const Game = mongoose.model("Game", GameSchema);

// 🔹 salvataggio partita
app.post("/game/save", async (req, res) => {
    const { sessionId, state } = req.body;
    if (!sessionId) return res.status(400).send("No sessionId");
    await Game.findOneAndUpdate(
        { sessionId },
        { state },
        { upsert: true, new: true }
    );
    res.send({ ok: true });
});

// 🔹 recupero partita
app.get("/game/:sessionId", async (req, res) => {
    const game = await Game.findOne({ sessionId: req.params.sessionId });
    if (!game) return res.json({});
    res.json(game.state);
});

app.listen(4000, () => console.log("✅ Server avviato su http://localhost:4000"));