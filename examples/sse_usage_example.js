/**
 * SSE Middleware Usage Examples
 * 
 * This file demonstrates how to use the SSE middleware with Express.js
 * to stream real-time data from script execution and other async operations.
 */

import express from 'express';
import { SSEMiddleware, withSSE } from '../core/sse_middleware.js';
import { executeScript } from '../core/script_runner.js';

const app = express();

// ============================================================================
// Example 1: Basic SSE Setup with Middleware
// ============================================================================

// Apply SSE middleware to a route
app.get('/events', SSEMiddleware(), (req, res) => {
  // Send initial connection message
  res.sendSSE({ message: 'Connected to event stream' }, 'connection', 1);

  // Send a few test events
  setTimeout(() => {
    res.sendSSE({ data: 'First event' }, 'message', 2);
  }, 500);

  setTimeout(() => {
    res.sendSSE({ data: 'Second event' }, 'message', 3);
  }, 1500);

  // Close after 3 seconds
  setTimeout(() => {
    res.closeSSE('Demo completed');
  }, 3000);
});

// ============================================================================
// Example 2: Stream Script Execution Results
// ============================================================================

app.post('/execute-stream', withSSE(async (req, res, helpers) => {
  const script = req.body; // Assume script is sent as body

  try {
    // Send start event
    await helpers.sendSSE(
      { status: 'started', script: script.substring(0, 50) + '...' },
      'execution_start'
    );

    // Execute script
    const result = await executeScript(script);

    // Send result event
    await helpers.sendSSE(
      { status: 'completed', result: result },
      'execution_result'
    );
  } catch (error) {
    // Send error event
    res.sendError(error);
  }
}));

// ============================================================================
// Example 3: Stream Multiple Operations with Progress
// ============================================================================

app.get('/multi-step-process', withSSE(async (req, res, helpers) => {
  const steps = [
    { name: 'Initialize', duration: 500 },
    { name: 'Process Data', duration: 1000 },
    { name: 'Generate Report', duration: 800 },
    { name: 'Finalize', duration: 300 },
  ];

  let completed = 0;
  const total = steps.length;

  for (const step of steps) {
    // Send step start
    await helpers.sendSSE(
      {
        status: 'step_start',
        step: step.name,
        progress: (completed / total) * 100,
      },
      'progress'
    );

    // Simulate step work
    await new Promise(resolve => setTimeout(resolve, step.duration));

    completed++;

    // Send step complete
    await helpers.sendSSE(
      {
        status: 'step_complete',
        step: step.name,
        progress: (completed / total) * 100,
      },
      'progress'
    );
  }
}));

// ============================================================================
// Example 4: Custom SSE Middleware with Callbacks
// ============================================================================

app.get('/custom-sse', SSEMiddleware({
  keepAliveInterval: 20000,
  maxRetries: 5,
  onConnect: (req, res) => {
    console.log('Client connected:', req.ip);
  },
  onDisconnect: (req, res) => {
    console.log('Client disconnected:', req.ip);
  },
}), (req, res) => {
  let counter = 0;

  // Send events every second
  const interval = setInterval(() => {
    counter++;

    if (counter > 10) {
      clearInterval(interval);
      res.closeSSE('Maximum events sent');
      return;
    }

    const success = res.sendSSE(
      { count: counter, timestamp: new Date().toISOString() },
      'tick',
      counter
    );

    if (!success) {
      clearInterval(interval);
    }
  }, 1000);

  // Handle early termination
  req.on('close', () => {
    clearInterval(interval);
  });
});

// ============================================================================
// Example 5: Error Handling and Recovery
// ============================================================================

app.get('/error-recovery', withSSE(async (req, res, helpers) => {
  try {
    // Simulate operations that might fail
    for (let i = 0; i < 5; i++) {
      await helpers.sendSSE(
        { attemptNumber: i + 1, status: 'processing' },
        'attempt'
      );

      if (i === 2) {
        throw new Error('Simulated error at step 3');
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    // Send error but continue to send completion
    res.sendError(error);
  }
}));

// ============================================================================
// Example 6: Stream Large Data in Chunks
// ============================================================================

app.get('/stream-large-data', withSSE(async (req, res, helpers) => {
  const largeArray = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    value: Math.random(),
  }));

  const chunkSize = 100;

  for (let i = 0; i < largeArray.length; i += chunkSize) {
    const chunk = largeArray.slice(i, i + chunkSize);

    await helpers.sendSSE(
      {
        chunkNumber: Math.floor(i / chunkSize) + 1,
        itemsInChunk: chunk.length,
        totalProcessed: Math.min(i + chunkSize, largeArray.length),
        totalItems: largeArray.length,
        data: chunk,
      },
      'data_chunk'
    );

    // Small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}));

// ============================================================================
// Client-Side Example (HTML)
// ============================================================================

/**
 * Example HTML to consume SSE events:
 * 
 * <!DOCTYPE html>
 * <html>
 * <head>
 *   <title>SSE Example</title>
 * </head>
 * <body>
 *   <div id="messages"></div>
 *   <script>
 *     const eventSource = new EventSource('/events');
 *     const container = document.getElementById('messages');
 *
 *     eventSource.addEventListener('message', (event) => {
 *       const data = JSON.parse(event.data);
 *       container.innerHTML += `<p>${JSON.stringify(data)}</p>`;
 *     });
 *
 *     eventSource.addEventListener('error', (event) => {
 *       console.error('SSE Error:', event);
 *       eventSource.close();
 *     });
 *
 *     eventSource.addEventListener('close', (event) => {
 *       console.log('Connection closed');
 *       eventSource.close();
 *     });
 *   </script>
 * </body>
 * </html>
 */

export { app };
