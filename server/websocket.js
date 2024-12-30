const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { setupWSConnection } = require('y-websocket/bin/utils');
const admin = require('./config/firebase-admin');
const filesRouter = require('./routes/files');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/files', filesRouter);

// Create server
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server });
wss.on('connection', setupWSConnection);

const port = process.env.PORT || 1234;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`- WebSocket server ready`);
  console.log(`- HTTP server ready`);
});
