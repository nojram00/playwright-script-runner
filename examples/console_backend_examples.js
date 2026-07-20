/**
 * Console Component Backend Integration Example
 * 
 * This file shows how to set up the backend to work with the Console component
 */

import express from 'express';
import { SSEMiddleware, withSSE } from '../core/sse_middleware.js';
import { executeScript } from '../core/script_runner.js';

const app = express();

// ============================================================================
// Example 1: Basic Log Endpoint
// ============================================================================

// Simple /log endpoint that sends test messages
app.get('/log', withSSE(async (req, res, helpers) => {
  // Send welcome message
  await helpers.sendSSE({ message: 'Console connected' }, 'log');

  // Simulate some activity
  for (let i = 1; i <= 5; i++) {
    await new Promise(r => setTimeout(r, 500));
    
    if (i === 3) {
      await helpers.sendSSE({ warning: 'Warning at step 3' }, 'warn');
    } else if (i === 5) {
      await helpers.sendSSE({ error: 'Error at step 5' }, 'error');
    } else {
      await helpers.sendSSE({ message: `Step ${i} completed` }, 'log');
    }
  }

  await helpers.sendSSE({ info: 'All steps completed' }, 'info');
}));

// ============================================================================
// Example 2: Script Execution with Logging
// ============================================================================

app.post('/execute-with-console', withSSE(async (req, res, helpers) => {
  let script = null;

  // Parse request body
  if (typeof req.body === 'string') {
    script = req.body;
  } else if (typeof req.body === 'object' && req.body !== null) {
    script = req.body.script || req.body.code;
  }

  if (!script || script.trim().length === 0) {
    await helpers.sendSSE({ error: 'Script body is required' }, 'error');
    return;
  }

  try {
    // Log: Script validation
    await helpers.sendSSE({ message: 'Validating script...' }, 'log');
    await new Promise(r => setTimeout(r, 200));

    // Log: Browser initialization
    await helpers.sendSSE({ info: 'Initializing browser...' }, 'info');

    // Execute the script
    const result = await executeScript(script);

    // Log: Execution complete
    await helpers.sendSSE({ info: 'Script execution completed' }, 'info');
    await helpers.sendSSE({
      message: `Result: ${JSON.stringify(result, null, 2)}`
    }, 'log');

  } catch (error) {
    // Log: Error occurred
    await helpers.sendSSE({
      error: `Execution failed: ${error.message}`
    }, 'error');

    console.error('Script execution error:', error);
  }
}));

// ============================================================================
// Example 3: Multi-stage Process with Progress
// ============================================================================

app.post('/process-with-logs', withSSE(async (req, res, helpers) => {
  const stages = [
    { name: 'Initialize', duration: 300 },
    { name: 'Validate', duration: 400 },
    { name: 'Process', duration: 1000 },
    { name: 'Finalize', duration: 300 }
  ];

  let completed = 0;
  const total = stages.length;

  await helpers.sendSSE({ info: 'Process started' }, 'info');

  for (const stage of stages) {
    try {
      // Send stage start
      await helpers.sendSSE({
        message: `Starting: ${stage.name} (${completed + 1}/${total})`
      }, 'log');

      // Simulate work
      await new Promise(r => setTimeout(r, stage.duration));

      completed++;

      // Send stage complete
      await helpers.sendSSE({
        message: `Completed: ${stage.name} - ${((completed / total) * 100).toFixed(0)}%`
      }, 'log');

    } catch (error) {
      await helpers.sendSSE({
        warning: `Stage ${stage.name} had issues: ${error.message}`
      }, 'warn');
    }
  }

  await helpers.sendSSE({ info: 'Process finished successfully' }, 'info');
}));

// ============================================================================
// Example 4: Error Handling and Recovery
// ============================================================================

app.post('/resilient-process', withSSE(async (req, res, helpers) => {
  const tasks = ['Task A', 'Task B', 'Task C', 'Task D'];
  let successCount = 0;
  let failureCount = 0;

  await helpers.sendSSE({ info: `Starting ${tasks.length} tasks` }, 'info');

  for (let i = 0; i < tasks.length; i++) {
    const taskName = tasks[i];

    try {
      await helpers.sendSSE({ message: `Executing ${taskName}...` }, 'log');

      // Simulate potential failure
      if (taskName === 'Task C') {
        throw new Error('Simulated failure');
      }

      // Simulate work
      await new Promise(r => setTimeout(r, 500));

      await helpers.sendSSE({ message: `${taskName} completed` }, 'log');
      successCount++;

    } catch (error) {
      failureCount++;
      await helpers.sendSSE({
        error: `${taskName} failed: ${error.message}`
      }, 'error');

      // Try recovery
      await helpers.sendSSE({
        warning: `Retrying ${taskName}...`
      }, 'warn');

      try {
        await new Promise(r => setTimeout(r, 500));
        successCount++;
        await helpers.sendSSE({
          message: `${taskName} recovered on retry`
        }, 'log');
      } catch (retryError) {
        await helpers.sendSSE({
          error: `${taskName} recovery failed`
        }, 'error');
      }
    }
  }

  // Summary
  await helpers.sendSSE({
    info: `Process complete: ${successCount} succeeded, ${failureCount} failed`
  }, 'info');
}));

// ============================================================================
// Example 5: Real-time Data Streaming with Logs
// ============================================================================

app.get('/stream-data-with-logs', withSSE(async (req, res, helpers) => {
  const dataSize = 1000;
  const chunkSize = 100;

  await helpers.sendSSE({
    info: `Starting to stream ${dataSize} items in chunks of ${chunkSize}`
  }, 'info');

  for (let i = 0; i < dataSize; i += chunkSize) {
    try {
      // Generate chunk
      const chunk = Array.from({ length: Math.min(chunkSize, dataSize - i) }, (_, idx) => ({
        id: i + idx,
        value: Math.random()
      }));

      const chunkNumber = Math.floor(i / chunkSize) + 1;
      const totalChunks = Math.ceil(dataSize / chunkSize);
      const progress = ((i + chunkSize) / dataSize * 100).toFixed(1);

      // Log progress
      await helpers.sendSSE({
        message: `Streamed chunk ${chunkNumber}/${totalChunks} (${progress}%)`
      }, 'log');

      // Small delay to simulate processing
      await new Promise(r => setTimeout(r, 100));

    } catch (error) {
      await helpers.sendSSE({
        error: `Error in chunk processing: ${error.message}`
      }, 'error');
    }
  }

  await helpers.sendSSE({ info: 'Data streaming complete' }, 'info');
}));

// ============================================================================
// Example 6: Structured Logging
// ============================================================================

// Helper function for structured logging
const logger = {
  log: async (helpers, message, data) => {
    const payload = data ? `${message} - ${JSON.stringify(data)}` : message;
    await helpers.sendSSE({ message: payload }, 'log');
  },

  info: async (helpers, message, data) => {
    const payload = data ? `${message} - ${JSON.stringify(data)}` : message;
    await helpers.sendSSE({ info: payload }, 'info');
  },

  warn: async (helpers, message, data) => {
    const payload = data ? `${message} - ${JSON.stringify(data)}` : message;
    await helpers.sendSSE({ warning: payload }, 'warn');
  },

  error: async (helpers, message, data) => {
    const payload = data ? `${message} - ${JSON.stringify(data)}` : message;
    await helpers.sendSSE({ error: payload }, 'error');
  }
};

app.post('/structured-logging', withSSE(async (req, res, helpers) => {
  await logger.info(helpers, 'Operation started', { timestamp: new Date().toISOString() });

  try {
    await logger.log(helpers, 'Fetching data from database', { query: 'SELECT * FROM users' });
    await new Promise(r => setTimeout(r, 500));

    await logger.log(helpers, 'Processing records', { count: 150 });
    await new Promise(r => setTimeout(r, 500));

    await logger.info(helpers, 'Data processing complete', { processed: 150 });

  } catch (error) {
    await logger.error(helpers, 'Operation failed', { error: error.message });
  }
}));

// ============================================================================
// Example 7: Custom Event Types
// ============================================================================

app.post('/custom-events', withSSE(async (req, res, helpers) => {
  // Send different types of structured data

  // Status update
  await helpers.sendSSE({
    type: 'status',
    status: 'running',
    message: 'Operation in progress'
  }, 'log');

  await new Promise(r => setTimeout(r, 500));

  // Progress update
  await helpers.sendSSE({
    type: 'progress',
    percent: 50,
    message: 'Halfway done'
  }, 'log');

  await new Promise(r => setTimeout(r, 500));

  // Debug info
  await helpers.sendSSE({
    type: 'debug',
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    message: 'Performance metrics'
  }, 'debug');

  // Completion
  await helpers.sendSSE({
    type: 'complete',
    status: 'success',
    duration: '2.5s',
    message: 'Operation completed'
  }, 'info');
}));

export { app };

// ============================================================================
// Usage Notes
// ============================================================================

/*
  To use these endpoints with the Console component:

  1. Ensure the Console component is in your App.tsx
  2. The Console connects to the /log endpoint by default
  3. For custom endpoints, you may need to modify useEventSource hook

  Example frontend usage:
  
  const handleExecute = async () => {
    await fetch('/execute-with-console', {
      method: 'POST',
      body: code,
      headers: { 'Content-Type': 'text/plain' }
    });
    // Console will automatically display the logs
  };

  Expected Console Output:
  
  14:23:45 💬 Validating script...
  14:23:46 ℹ Initializing browser...
  14:23:50 ✓ Script execution completed
  14:23:51 💬 Result: {...}
*/
