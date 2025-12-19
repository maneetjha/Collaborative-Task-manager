const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); 
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
    cors: { origin: "*" } 
});


const userSockets = new Map();       // Store mapping: Key = UserID (string), Value = SocketID (string)



io.use((socket, next) => {
    // Note: Frontend must pass this in the 'auth' object
    const token = socket.handshake.auth.token; 
    
    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Attach the ID directly to the socket object for later use
        socket.userId = decoded.id; 
        next();
    } catch (err) {
        next(new Error("Authentication error: Invalid token"));
    }
});




io.on('connection', (socket) => {
    // 1. Map the authenticated user to their socket ID
    userSockets.set(socket.userId, socket.id);
    console.log(`✅ User connected: ${socket.userId} (Socket: ${socket.id})`);

    // 2. Handle Disconnection
    socket.on('disconnect', (reason) => {
        userSockets.delete(socket.userId);
        console.log(`❌ User disconnected: ${socket.userId} (${reason})`);
    });
});


module.exports = { app, server, io, userSockets };

