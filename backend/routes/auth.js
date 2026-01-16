const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();

let otpStore = {};

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

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    return { accessToken, refreshToken };
}

function generateServerToken(user) {
    if (!process.env.JWT_S1_SECRET) {
        throw new Error("JWT_S1_SECRET non definito in .env");
    }
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_S1_SECRET,
        { expiresIn: '7d' }
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


        const { accessToken, refreshToken } = await generateTokens(user);
        let tokenS1;
        try {
            tokenS1 = generateServerToken(user);
        } catch (err) {
            console.error("JWT_S1_SECRET mancante:", err.message);
            return res.status(500).json({ msg: "Configurazione server errata (manca JWT_S1_SECRET)" });
        }


        if (consent) {
            const secureFlag = process.env.NODE_ENV === 'production';
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: secureFlag,
                sameSite: "Lax",
                maxAge: 15 * 60 * 1000
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: secureFlag,
                sameSite: "Lax",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
        }


        res.json({ username: user.username,tokenS1, msg: 'Login effettuato' });
    } catch (err) {
        console.error("Errore in /login:", err);
        res.status(500).json({ msg: 'Errore del server', error: err.message });
    }
});


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


router.get("/profile", authMiddleware, (req, res) => {
    res.json({ msg: "Profilo utente", user: req.user });
});


router.post("/logout", async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
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

// REFRESH TOKEN
router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ msg: 'Refresh token mancante' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(403).json({ msg: 'Utente non trovato' });
        }


        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            return res.status(403).json({ msg: 'Refresh token non valido' });
        }

        // ROTATION
        const newRefreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        const accessToken = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const secureFlag = process.env.NODE_ENV === 'production';

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: secureFlag,
            sameSite: "Lax",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: secureFlag,
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ msg: 'Access token rinnovato' });
    } catch (err) {
        console.error("Errore in /refresh:", err);
        return res.status(403).json({ msg: 'Refresh token scaduto o non valido' });
    }
});

module.exports = router;
