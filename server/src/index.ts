import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for now, restrictive in prod
        methods: ['GET', 'POST']
    }
});

// Routes
import authRoutes from './routes/auth';
import dataRoutes from './routes/data';
import groupRoutes from './routes/groups';
import aiRoutes from './routes/ai';
import taskRoutes from './routes/tasks';
import habitRoutes from './routes/habits';
import userRoutes from './routes/users';

// Middleware
app.use(cors());
app.use(express.json());

// Set Socket.io
app.set('socketio', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes); // Legacy/General
app.use('/api/groups', groupRoutes);
app.use('/api/ai', aiRoutes);
// Strict Schema Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);

app.get('/', (req, res) => {
    res.send('Progress Loop Backend is Running');
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/progress-loop';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Socket.io
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_group', (groupId) => {
        socket.join(groupId);
        console.log(`User ${socket.id} joined group ${groupId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { io };
