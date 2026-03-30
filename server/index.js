const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/mongodb');
const { errorHandler } = require('./middlewares/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io accessible to our router
app.set('socketio', io);

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Routes
app.use('/api/admin', require('./routes/adminRoute'));
app.use('/api/client', require('./routes/clientRoute'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/broadcasts', require('./routes/broadcastRoutes'));
app.use('/api/families', require('./routes/familyRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/shelters', require('./routes/shelterRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/heatmap', require('./routes/heatmapRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('Crisis Management API is running...');
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
