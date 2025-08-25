const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

let otpStore = {}; // { email: { code: '123456', expires: Date } }



// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Credenziali non valide' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Credenziali non valide' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET/*|| JWT_SECRET1*/, { expiresIn: '1h' });

        res.json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ msg: 'Errore del server' });
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


module.exports = router;
