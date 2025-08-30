const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ msg: "Non autorizzato" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ msg: "Token non valido" });
    }
}

module.exports = authMiddleware;
