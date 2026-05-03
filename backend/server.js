require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const notificationRoutes = require('./routes/notifications');
const activityRoutes = require('./routes/activity');
const userRoutes = require('./routes/users');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Set io instance so it can be accessed in controllers
app.set('io', io);

// Socket connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // User joins their personal room and project rooms
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/notifications', notificationRoutes);
app.use('/activity', activityRoutes);

app.get('/', (req, res) => {
  res.send('TaskFlow API is running');
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => console.error('MongoDB connection error:', err));
}

module.exports = { app, server };
