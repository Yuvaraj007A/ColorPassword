const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = async () => {
  const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/color_auth';
  const mongoose = require('mongoose');
  await mongoose.connect(connStr);
  console.log('MongoDB Connected successfully');
};
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
  // Seed default admin if database is connected
  seedAdmin();
});

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: '*', // For local development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Fingerprint']
}));
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rate Limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 15, // max 15 requests per minute
  message: { error: 'Too many requests. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Color Palette Graphical Authentication API is active.' });
});

// Seeding function for Admin
async function seedAdmin() {
  try {
    const User = require('./models/User');
    const { hashColorPattern } = require('./utils/colorAuth');

    const adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      // Default admin color password: Red, Green, Blue, Yellow, White
      const defaultAdminColors = [
        { r: 255, g: 0, b: 0 },       // Red
        { r: 0, g: 255, b: 0 },       // Green
        { r: 0, g: 0, b: 255 },       // Blue
        { r: 255, g: 255, b: 0 },     // Yellow
        { r: 255, g: 255, b: 255 },   // White
      ];

      const colorHash = await hashColorPattern(defaultAdminColors);

      const admin = new User({
        username: 'admin',
        email: 'admin@demo.com',
        colorHash,
        isAdmin: true,
      });

      await admin.save();
      console.log('==================================================');
      console.log('   DEFAULT ADMIN SEEDED SUCCESSFULLY');
      console.log('   Username: admin');
      console.log('   Email: admin@demo.com');
      console.log('   Color Password sequence (in order):');
      console.log('     1. Red     (255, 0, 0)');
      console.log('     2. Green   (0, 255, 0)');
      console.log('     3. Blue    (0, 0, 255)');
      console.log('     4. Yellow  (255, 255, 0)');
      console.log('     5. White   (255, 255, 255)');
      console.log('==================================================');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

// Start Server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Clean shutdown signal handlers
process.once('SIGUSR2', () => {
  server.close(() => {
    console.log('Closing server on port 5000, allowing Nodemon to restart safely.');
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server process terminated. Exiting.');
    process.exit(0);
  });
});

