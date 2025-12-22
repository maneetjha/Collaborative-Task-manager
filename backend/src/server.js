require('dotenv').config(); 
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Import Routes
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes'); 


// 2. Import Socket Utility Logic
const { init, userSockets } = require('./utils/socket.util'); 

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

const app = express();
const server = http.createServer(app); 




// 3. Initialize Socket.io
// CORS configuration - allow Vercel frontend and localhost for development
const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://collaborative-task-manager-swart.vercel.app'
];

const allowedOrigins = process.env.FRONTEND_URL 
    ? [...defaultOrigins, ...process.env.FRONTEND_URL.split(',').map(url => url.trim())]
    : defaultOrigins;

const io = new Server(server, {
    cors: { 
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'token']
    } 
});

init(io);



// 4. Global Middlewares
// CORS configuration for production
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`CORS blocked origin: ${origin}`);
            console.log(`Allowed origins: ${JSON.stringify(allowedOrigins)}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));
app.use(express.json()); 




// 5. Connect Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);




// 6. Database Connection
mongoose.connect(MONGO_URL)
    .then(() => console.log('📦 Connected to MongoDB Successfully'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });




// 7. Socket.io Authentication Middleware
io.use((socket, next) => {
    const token = 
        socket.handshake.headers.token || 
        socket.handshake.headers.authorization?.split(' ')[1] || 
        socket.handshake.auth.token;
        
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




// 8. Socket.io Connection Logic
io.on('connection', (socket) => {
    // Save user to the shared Map in socket.util
    userSockets.set(socket.userId.toString(), socket.id);
    console.log(`✅ User connected: ${socket.userId} (Socket: ${socket.id})`);

    socket.on('disconnect', () => {
        userSockets.delete(socket.userId.toString());
        console.log(`❌ User disconnected: ${socket.userId}`);
    });
});



// 9. Health Check & Server Start
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server is live and waiting...`);
});


module.exports = { app, server };