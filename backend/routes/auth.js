const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();

let otpStore = {}; // { email: { code: '123456', expires: Date } }

async function generateTokens(user) {
    const accessToken = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    // salva il refresh token nel DB (aggiunge alla lista delle sessioni)
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    return { accessToken, refreshToken };
}

function generateServerToken(user) {
    if (!process.env.JWT_S1_SECRET) {
        throw new Error("JWT_S1_SECRET non definito in .env");
    }
    // payload minimo con id e username
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_S1_SECRET,
        { expiresIn: '7d' } // regola la durata come preferisci
    );
}

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password, consent } = req.body;

    try {
        console.log("Tentativo login:", email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log("Utente non trovato");
            return res.status(400).json({ msg: 'Credenziali non valide' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password errata");
            return res.status(400).json({ msg: 'Credenziali non valide' });
        }

        if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
            console.error("❌ JWT_SECRET o JWT_REFRESH_SECRET non definiti in .env");
            return res.status(500).json({ msg: "Configurazione server errata (mancano secret)" });
        }

        // Genera access e refresh token e salva refresh token nel DB
        const { accessToken, refreshToken } = await generateTokens(user);
        let tokenS1;
        try {
            tokenS1 = generateServerToken(user);
        } catch (err) {
            console.error("JWT_S1_SECRET mancante:", err.message);
            return res.status(500).json({ msg: "Configurazione server errata (manca JWT_S1_SECRET)" });
        }

        // Se l'utente ha dato il consenso, setta il cookie (httpOnly)
        if (consent) {
            const secureFlag = process.env.NODE_ENV === 'production';
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: secureFlag,
                sameSite: "Lax",
                maxAge: 15 * 60 * 1000 // 15 minuti
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: secureFlag,
                sameSite: "Lax",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 giorni
            });
        }

        // Nota: NON restituiamo il token nel body per evitare che venga salvato in localStorage lato client
        res.json({ username: user.username,tokenS1, msg: 'Login effettuato' });
    } catch (err) {
        console.error("Errore in /login:", err);
        res.status(500).json({ msg: 'Errore del server', error: err.message });
    }
});

// Configura nodemailer con Ethereal
async function createTransporter() {
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.ETHEREAL_USER,
            pass: process.env.ETHEREAL_PASS
        }
    });
}

// INVIO OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: 'Email già registrata' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = { code: otp, expires: Date.now() + 5 * 60 * 1000 };

        const transporter = await createTransporter();
        const info = await transporter.sendMail({
            from: '"Verifica Account" <noreply@test.com>',
            to: email,
            subject: "Il tuo codice OTP",
            text: `Il tuo codice OTP è: ${otp}`,
            html: `<b>Il tuo codice OTP è: ${otp}</b>`
        });

        console.log("Anteprima email OTP:", nodemailer.getTestMessageUrl(info));
        res.json({ msg: 'OTP inviato via email' });
    } catch (err) {
        console.error("Errore in /send-otp:", err);
        res.status(500).json({ msg: 'Errore nell\'invio OTP', error: err.message });
    }
});

// VERIFICA OTP
router.post('/verify-otp', async (req, res) => {
    const { username, email, password, otp } = req.body;

    try {
        const record = otpStore[email];
        if (!record) return res.status(400).json({ msg: 'OTP non richiesto' });
        if (Date.now() > record.expires) return res.status(400).json({ msg: 'OTP scaduto' });
        if (record.code !== otp) return res.status(400).json({ msg: 'OTP non valido' });

        delete otpStore[email];

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ msg: 'Registrazione avvenuta con successo' });
    } catch (err) {
        console.error("Errore in /verify-otp:", err);
        res.status(500).json({ msg: 'Errore del server', error: err.message });
    }
});

const authMiddleware = require("../middleware/authMiddleware");

//Informazione del profilo, solo se l'utente è autenticato
router.get("/profile", authMiddleware, (req, res) => {
    res.json({ msg: "Profilo utente", user: req.user });
});

//Cancella il token di sessione e rimuove il refresh token server-side
router.post("/logout", async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            // cerca l'utente che ha questo refresh token e lo rimuove
            const user = await User.findOne({ refreshTokens: refreshToken });
            if (user) {
                user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
                await user.save();
            }
        }

        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Lax"
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Lax"
        });

        res.json({ msg: "Logout effettuato" });
    } catch (err) {
        console.error("Errore in /logout:", err);
        res.status(500).json({ msg: 'Errore nel logout', error: err.message });
    }
});

// REFRESH TOKEN (rotation)
router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ msg: 'Refresh token mancante' });

    try {
        // verifica firma del refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // trova utente corrispondente
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(403).json({ msg: 'Utente non trovato' });
        }

        // controlla che il refresh token sia ancora registrato per quell'utente
        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            // refresh token non trovato: possibile tentativo di reuse/abuso
            return res.status(403).json({ msg: 'Refresh token non valido' });
        }

        // ROTATION: crea nuovo refresh token e sostituisce quello vecchio
        const newRefreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // rimuove il token usato e aggiunge il nuovo
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        // crea nuovo access token
        const accessToken = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const secureFlag = process.env.NODE_ENV === 'production';

        // setta cookie nuovi
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: secureFlag,
            sameSite: "Lax",
            maxAge: 15 * 60 * 1000 // 15 min
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: secureFlag,
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 giorni
        });

        res.json({ msg: 'Access token rinnovato' });
    } catch (err) {
        console.error("Errore in /refresh:", err);
        return res.status(403).json({ msg: 'Refresh token scaduto o non valido' });
    }
});

module.exports = router;
