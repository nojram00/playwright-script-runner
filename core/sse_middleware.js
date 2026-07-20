
/**
 * Async SSE (Server-Sent Events) Middleware for Express.js
 * 
 * This middleware provides Server-Sent Events capabilities for streaming real-time data
 * from the server to connected clients. It includes:
 * - Response header setup for SSE
 * - Event sending utilities (send, retry, close)
 * - Error handling with automatic recovery
 * - Connection lifecycle management
 * - Data formatting and encoding for SSE protocol
 */

/**
 * SSE Middleware - Sets up Server-Sent Events for async streaming
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.keepAliveInterval - Interval in ms to send keep-alive comments (default: 30000)
 * @param {number} options.maxRetries - Max retries before closing connection (default: 3)
 * @param {Function} options.onConnect - Callback when client connects
 * @param {Function} options.onDisconnect - Callback when client disconnects
 * @returns {Function} Express middleware function
 */
function SSEMiddleware(options = {}) {
  const {
    keepAliveInterval = 30000,
    maxRetries = 3,
    onConnect = null,
    onDisconnect = null,
  } = options;

  return async (req, res, next) => {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering in proxies

    // Track connection state
    let isConnected = true;
    let keepAliveTimer = null;

    /**
     * Send an SSE formatted event to the client
     * 
     * @param {string} data - Event data (will be JSON stringified if object)
     * @param {string} eventType - Event type (default: 'message')
     * @param {string|number} id - Event ID for client tracking
     * @returns {boolean} True if sent successfully, false if connection closed
     */
    res.sendSSE = (data, eventType = 'message', id = null) => {
      if (!isConnected) return false;

      try {
        let message = '';

        if (id !== null) {
          message += `id: ${id}\n`;
        }

        message += `event: ${eventType}\n`;
        
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
        // Split data by newlines and prefix each line with 'data: '
        const lines = dataStr.split('\n');
        lines.forEach((line) => {
          message += `data: ${line}\n`;
        });

        message += '\n';

        res.write(message);
        return true;
      } catch (error) {
        console.error('Error sending SSE event:', error.message);
        isConnected = false;
        return false;
      }
    };

    /**
     * Send a retry event (tells client to retry after specified milliseconds)
     * 
     * @param {number} retryMs - Milliseconds before retry (default: 1000)
     * @returns {boolean} True if sent successfully
     */
    res.sendRetry = (retryMs = 1000) => {
      if (!isConnected) return false;
      try {
        res.write(`retry: ${retryMs}\n\n`);
        return true;
      } catch (error) {
        console.error('Error sending retry:', error.message);
        isConnected = false;
        return false;
      }
    };

    /**
     * Send a comment (useful for keep-alive)
     * 
     * @param {string} comment - Comment text
     * @returns {boolean} True if sent successfully
     */
    res.sendComment = (comment = '') => {
      if (!isConnected) return false;
      try {
        res.write(`: ${comment}\n`);
        return true;
      } catch (error) {
        console.error('Error sending comment:', error.message);
        isConnected = false;
        return false;
      }
    };

    /**
     * Send an error event
     * 
     * @param {string|Error} error - Error message or Error object
     * @param {string|number} id - Event ID for tracking
     * @returns {boolean} True if sent successfully
     */
    res.sendError = (error, id = null) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.sendSSE(
        { error: errorMessage, timestamp: new Date().toISOString() },
        'error',
        id
      );
    };

    /**
     * Close the SSE connection gracefully
     * 
     * @param {string} reason - Reason for closing (optional)
     */
    res.closeSSE = (reason = 'Connection closed') => {
      isConnected = false;

      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }

      try {
        res.sendComment(`Closing: ${reason}`);
        res.end();
      } catch (error) {
        console.error('Error closing SSE connection:', error.message);
      }
    };

    /**
     * Set up keep-alive to prevent connection timeout
     */
    const setupKeepAlive = () => {
      keepAliveTimer = setInterval(() => {
        if (isConnected) {
          res.sendComment('keep-alive');
        } else {
          if (keepAliveTimer) {
            clearInterval(keepAliveTimer);
          }
        }
      }, keepAliveInterval);
    };

    // Handle client disconnect
    req.on('close', () => {
      isConnected = false;
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
      }
      if (onDisconnect) {
        onDisconnect(req, res);
      }
    });

    req.on('error', (error) => {
      console.error('Request error:', error.message);
      isConnected = false;
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
      }
    });

    // Set up keep-alive
    setupKeepAlive();

    // Call connection callback if provided
    if (onConnect) {
      onConnect(req, res);
    }

    // Continue to next middleware
    next();
  };
}

/**
 * Async SSE Handler - Helper for executing async operations and streaming results
 * 
 * @param {Function} asyncFn - Async function that yields events
 * @param {Object} options - Options (retries, timeout, etc.)
 * @returns {Function} Express route handler
 */
function withSSE(asyncFn, options = {}) {
  const { maxRetries = 3, timeout = 60000 } = options;

  return async (req, res) => {
    let eventId = 0;
    let retryCount = 0;

    const sendWithRetry = async (data, eventType = 'message') => {
      const eventData = {
        id: eventId++,
        timestamp: new Date().toISOString(),
        ...data,
      };

      const success = res.sendSSE(eventData, eventType, eventData.id);

      if (!success && retryCount < maxRetries) {
        retryCount++;
        res.sendRetry(1000 * retryCount);
      }

      return success;
    };

    try {
      // Call the async function with streaming helpers
      await asyncFn(req, res, { sendSSE: sendWithRetry, eventId: () => eventId });

      // Send completion event
      res.sendSSE(
        { message: 'Stream completed', eventCount: eventId },
        'complete',
        eventId
      );
    } catch (error) {
      console.error('SSE handler error:', error);
      res.sendError(error, eventId);
    } finally {
      // Close connection after a short delay to ensure last messages are sent
      setTimeout(() => {
        res.closeSSE('Handler completed');
      }, 100);
    }
  };
}

/**
 * Original SSE middleware signature for backward compatibility
 * Use SSEMiddleware() instead for better control
 */

export { SSE, SSEMiddleware, withSSE }
async function SSE(req, res, next) {
  return SSEMiddleware()(req, res, next);
}