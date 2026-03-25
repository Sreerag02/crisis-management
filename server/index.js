const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/mongodb');
const { errorHandler } = require('./middlewares/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

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

// Basic Route
app.get('/', (req, res) => {
  res.send('Crisis Management API is running...');
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
