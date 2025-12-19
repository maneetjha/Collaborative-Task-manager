const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function auth(req, res, next) {
    
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({ message: "No token provided. Access denied." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userid = decoded.id; 
        next();
        
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = auth;