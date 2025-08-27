const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
const { setupTokenRefreshScheduler } = require('./utils/tokenRefresher');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Configure CORS properly for cookies to work
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['X-Auth-Token', 'Authorization']
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tokenRoutes = require('./routes/token.routes');
const subscriptionRoutes = require('./routes/subscription.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api', tokenRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({ 
      status: 'ok', 
      message: 'Server is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Database connection failed'
    });
  }
});

// SSL setup help page
app.get('/ssl-setup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ssl-setup.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'An unknown error occurred',
  });
});

// Start HTTP and HTTPS servers
let httpsServer;
let httpServer;

try {
  // Check if SSL certificates exist
  const keyPath = path.join(__dirname, 'certs', 'key.pem');
  const certPath = path.join(__dirname, 'certs', 'cert.pem');
  
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    
    // Create HTTPS server
    httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(PORT, () => {
      console.log(`HTTPS Server running on https://localhost:${PORT}`);
    });
    
    // Also create an HTTP server that redirects to HTTPS
    httpServer = http.createServer((req, res) => {
      res.writeHead(301, { "Location": `https://localhost:${PORT}${req.url}` });
      res.end();
    });
    
    // HTTP server on port 5001
    httpServer.listen(PORT+1, () => {
      console.log(`HTTP Server running on http://localhost:${PORT+1} (redirects to HTTPS)`);
    });
  } else {
    console.log('SSL certificates not found. Run `node scripts/generate-certs.js` to generate certificates.');
    console.log('Starting HTTP server only (Instagram callbacks may not work)');
    
    // Start regular HTTP server
    httpServer = http.createServer(app);
    httpServer.listen(PORT, () => {
      console.log(`HTTP Server running on http://localhost:${PORT}`);
    });
  }
  
  // Set up token refresh scheduler
  setupTokenRefreshScheduler();
} catch (err) {
  console.error('Error starting server:', err);
  console.log('Starting HTTP server as fallback');
  
  // Start regular HTTP server as fallback
  httpServer = http.createServer(app);
  httpServer.listen(PORT, () => {
    console.log(`HTTP Server running on http://localhost:${PORT}`);
  });
}

// Handle process termination
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from database');
  
  if (httpsServer) httpsServer.close();
  if (httpServer) httpServer.close();
  
  console.log('Servers closed');
  process.exit(0);
});

module.exports = app;
