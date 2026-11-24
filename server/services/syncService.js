/**
 * Centralized Real-Time Synchronization Service (SSE)
 * Single source of truth: broadcasts database update events to all connected clients.
 */

const clients = new Set();

/**
 * Handle new incoming SSE connection
 */
function handleSyncStream(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no'
  });

  // Send initial handshake
  const handshake = JSON.stringify({
    type: 'connected',
    message: 'Global Content Synchronization stream established',
    timestamp: new Date().toISOString()
  });
  res.write(`data: ${handshake}\n\n`);

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
}

/**
 * Broadcast an event to all connected clients
 * @param {string} eventType - e.g. 'question_updated', 'music_updated'
 * @param {object} payload - event details
 */
function broadcastSyncEvent(eventType, payload = {}) {
  const message = JSON.stringify({
    type: eventType,
    data: payload,
    timestamp: new Date().toISOString()
  });

  const formatted = `data: ${message}\n\n`;

  for (const client of clients) {
    try {
      client.write(formatted);
    } catch (err) {
      clients.delete(client);
    }
  }
}

/**
 * Heartbeat interval (every 25 seconds) to keep connections alive
 */
setInterval(() => {
  for (const client of clients) {
    try {
      client.write(': keepalive\n\n');
    } catch (err) {
      clients.delete(client);
    }
  }
}, 25000);

function getClientCount() {
  return clients.size;
}

module.exports = {
  handleSyncStream,
  broadcastSyncEvent,
  getClientCount
};
