#!/usr/bin/env node
import { env } from 'node:process';
import config from './services/config.js';
import bark from 'bark-logger';
import http from 'http';
import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import { fuzzyMatch } from './util.js';

// Global state
const appName = 'homeweb-server';
const settings = config.getAppConfig();
const log = bark.getLogger(appName);
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Global config
process.env.TZ = settings.timezone;
bark.config.threshold = env.LOGLEVEL ?? bark.Levels.DEBUG;

// HTTP requests
app.get('*', (req, res) => {
  res.send('Hello HTTP!');
});

// Websocket requests
server.on('upgrade', (req, socket, head) => {
  log.debug(`upgrade request for ${req.url}`);
  if (fuzzyMatch(req.url, '/ws')) {
    wss.handleUpgrade(req, socket, head, (conn) => {
      wss.emit('connection', conn, req);
    });
  }
  else {
    socket.destroy();
  }
});

wss.on('connection', conn => {
  conn.send(`Hello websocket!`);
});

// Testing
setInterval(() => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      log.debug('sending message to client');
      client.send(`The time is currently ${new Date().toLocaleString()}`);
    }
    else {
      log.debug('client left :(');
    }
  });
}, 1000);

// Start server!
server.listen(settings.serverPort)
log.info(`Server running on port ${settings.serverPort}`);

// Clean up on exit
process.on('SIGINT', () => {
  log.info('Service shutting down!');
  process.exit(0);
});