require('dotenv').config(); 
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

const app = express();
const server = http.createServer(app); 


app.use(express.json()); 


const io = new Server(server, {
    cors: { origin: "*" } 
});

// Store mapping: Key = UserID (string), Value = SocketID (string)
// This is used to store the mapping of userID to socketID
//This aassumes that frontend does reconnection on error.
const userSockets = new Map(); 



mongoose.connect(MONGO_URL)
    .then(() => console.log('📦 Connected to MongoDB Successfully'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });


io.use((socket, next) => {
    const token = socket.handshake.auth.token; 
    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.id; 
        next();
    } catch (err) {
        next(new Error("Authentication error: Invalid token"));
    }
});

io.on('connection', (socket) => {
    userSockets.set(socket.userId, socket.id);
    console.log(`✅ User connected: ${socket.userId} (Socket: ${socket.id})`);

    socket.on('disconnect', (reason) => {
        userSockets.delete(socket.userId);
        console.log(`❌ User disconnected: ${socket.userId} (${reason})`);
    });
});


app.get('/', (req, res) => {
    res.send('Server is up and running!');
});


server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server is live and waiting...`);
});


module.exports = { app, server, io, userSockets };