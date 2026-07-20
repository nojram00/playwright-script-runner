# Async SSE Middleware Guide

## Overview

The SSE (Server-Sent Events) Middleware provides real-time, one-way communication from the server to connected clients. It's perfect for streaming script execution results, progress updates, and other long-running operations.

## Key Features

✅ **Async/Await Support** - Fully async middleware for Express.js  
✅ **Keep-Alive Management** - Automatic keep-alive to prevent connection timeouts  
✅ **Error Handling** - Built-in error events and recovery mechanisms  
✅ **Event Streaming** - Multiple event types with IDs for client tracking  
✅ **Connection Lifecycle** - Callbacks for connect/disconnect events  
✅ **Graceful Shutdown** - Clean connection closure with reason messages  
✅ **Retry Support** - Automatic retry logic for failed transmissions  

## Installation & Setup

### Import the middleware

```javascript
import { SSEMiddleware, withSSE } from './core/sse_middleware.js';
```

### Apply to Express app

```javascript
import express from 'express';
import { SSEMiddleware } from './core/sse_middleware.js';

const app = express();

// Option 1: Apply globally
app.use(SSEMiddleware());

// Option 2: Apply to specific route
app.get('/events', SSEMiddleware(), (req, res) => {
  res.sendSSE({ message: 'Hello!' });
});
```

## API Reference

### SSEMiddleware(options)

Creates an Express middleware that sets up SSE capabilities.

**Parameters:**
- `options` (Object, optional):
  - `keepAliveInterval` (number): Milliseconds between keep-alive comments (default: 30000)
  - `maxRetries` (number): Maximum retry attempts (default: 3)
  - `onConnect` (Function): Callback when client connects
  - `onDisconnect` (Function): Callback when client disconnects

**Returns:** Express middleware function

**Example:**
```javascript
app.get('/stream', SSEMiddleware({
  keepAliveInterval: 20000,
  onConnect: (req, res) => console.log('Client connected'),
  onDisconnect: (req, res) => console.log('Client disconnected'),
}), (req, res) => {
  res.sendSSE({ message: 'Hello!' });
});
```

### res.sendSSE(data, eventType, id)

Send an SSE formatted event to the client.

**Parameters:**
- `data` (string|Object): Event payload (auto-JSON stringified)
- `eventType` (string): Event name (default: 'message')
- `id` (string|number): Event ID for client tracking (optional)

**Returns:** boolean - True if sent successfully

**Example:**
```javascript
res.sendSSE({ title: 'Page Title' }, 'page_info', 1);
res.sendSSE('Simple text message');
res.sendSSE({ error: 'Something went wrong' }, 'error');
```

**SSE Format Generated:**
```
id: 1
event: page_info
data: {"title":"Page Title"}

```

### res.sendRetry(retryMs)

Tell the client to retry connection after specified milliseconds.

**Parameters:**
- `retryMs` (number): Milliseconds to wait before retry (default: 1000)

**Returns:** boolean - True if sent successfully

**Example:**
```javascript
res.sendRetry(5000); // Retry in 5 seconds
```

### res.sendComment(comment)

Send a comment (useful for keep-alive, won't be delivered as event).

**Parameters:**
- `comment` (string): Comment text

**Returns:** boolean - True if sent successfully

**Example:**
```javascript
res.sendComment('Processing data...');
```

### res.sendError(error, id)

Send a formatted error event.

**Parameters:**
- `error` (string|Error): Error message or Error object
- `id` (string|number): Event ID (optional)

**Returns:** boolean - True if sent successfully

**Example:**
```javascript
try {
  // some operation
} catch (error) {
  res.sendError(error, 1);
}
```

**Event Format:**
```javascript
{
  error: "Error message",
  timestamp: "2026-07-20T14:11:17Z"
}
```

### res.closeSSE(reason)

Close the SSE connection gracefully.

**Parameters:**
- `reason` (string): Reason for closing (optional)

**Example:**
```javascript
res.closeSSE('All data sent');
```

## withSSE(asyncFn, options)

Wrapper for async route handlers with automatic event handling and error management.

**Parameters:**
- `asyncFn` (Function): Async handler function(req, res, helpers)
- `options` (Object, optional):
  - `maxRetries` (number): Max retries for failed sends
  - `timeout` (number): Operation timeout in ms

**Helper object properties:**
- `sendSSE(data, eventType)` - Send event with auto ID and timestamp
- `eventId()` - Get current event ID

**Returns:** Express route handler

**Example:**
```javascript
app.post('/execute', withSSE(async (req, res, helpers) => {
  try {
    await helpers.sendSSE({ status: 'started' }, 'start');
    
    const result = await executeScript(req.body);
    
    await helpers.sendSSE({ result }, 'result');
  } catch (error) {
    res.sendError(error);
  }
}));
```

## Practical Examples

### Example 1: Simple Event Stream

```javascript
app.get('/live', SSEMiddleware(), (req, res) => {
  let count = 0;

  const interval = setInterval(() => {
    if (count >= 5) {
      clearInterval(interval);
      res.closeSSE('Complete');
      return;
    }

    res.sendSSE({ count: ++count }, 'tick', count);
  }, 1000);
});
```

### Example 2: Stream Script Execution

```javascript
import { executeScript } from './core/script_runner.js';

app.post('/execute-stream', withSSE(async (req, res, helpers) => {
  const script = req.body;

  await helpers.sendSSE({ status: 'validating' }, 'status');
  
  try {
    await helpers.sendSSE({ status: 'executing' }, 'status');
    const result = await executeScript(script);
    
    await helpers.sendSSE({ result }, 'complete');
  } catch (error) {
    res.sendError(error);
  }
}));
```

### Example 3: Progress Updates

```javascript
app.get('/progress', withSSE(async (req, res, helpers) => {
  const tasks = ['Initialize', 'Process', 'Validate', 'Save'];
  
  for (let i = 0; i < tasks.length; i++) {
    await helpers.sendSSE({
      current: i + 1,
      total: tasks.length,
      task: tasks[i],
      percent: ((i + 1) / tasks.length) * 100
    }, 'progress');
    
    await new Promise(r => setTimeout(r, 1000));
  }
}));
```

### Example 4: Data Streaming in Chunks

```javascript
app.get('/large-data', withSSE(async (req, res, helpers) => {
  const items = Array.from({ length: 10000 }, (_, i) => ({ id: i }));
  const chunkSize = 100;

  for (let i = 0; i < items.length; i += chunkSize) {
    await helpers.sendSSE({
      items: items.slice(i, i + chunkSize),
      progress: ((i + chunkSize) / items.length) * 100
    }, 'chunk');
  }
}));
```

## Client-Side Implementation

### Using native EventSource API

```html
<!DOCTYPE html>
<html>
<head>
  <title>SSE Client</title>
</head>
<body>
  <div id="output"></div>

  <script>
    const output = document.getElementById('output');
    const eventSource = new EventSource('/live');

    // Listen to 'tick' events
    eventSource.addEventListener('tick', (event) => {
      const data = JSON.parse(event.data);
      output.innerHTML += `<p>Tick: ${data.count}</p>`;
    });

    // Listen to 'complete' events
    eventSource.addEventListener('complete', (event) => {
      const data = JSON.parse(event.data);
      output.innerHTML += `<p>Complete: ${data.message}</p>`;
      eventSource.close();
    });

    // Handle errors
    eventSource.addEventListener('error', (event) => {
      console.error('Connection error:', event);
      eventSource.close();
    });

    // Generic message handler (fallback)
    eventSource.addEventListener('message', (event) => {
      console.log('Message:', event.data);
    });
  </script>
</body>
</html>
```

### Using fetch with ReadableStream (modern approach)

```javascript
async function streamEvents() {
  try {
    const response = await fetch('/live');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      console.log('Received:', text);
    }
  } catch (error) {
    console.error('Stream error:', error);
  }
}
```

## Connection Management

### Keep-Alive

The middleware automatically sends keep-alive comments at the specified interval to prevent proxy/firewall timeouts.

```javascript
SSEMiddleware({
  keepAliveInterval: 30000 // Send every 30 seconds
})
```

### Automatic Reconnection (Client)

Browsers' EventSource API automatically reconnects on connection loss:

```javascript
const eventSource = new EventSource('/events');

// Auto-reconnects after 1 second by default
// Change retry with server response:
// res.sendRetry(5000); // Retry after 5 seconds
```

### Manual Cleanup

```javascript
// Server side
req.on('close', () => {
  console.log('Client disconnected');
  // Cleanup resources
});

// Client side
eventSource.close();
```

## Error Handling

### Server Error Events

```javascript
app.get('/error-handling', withSSE(async (req, res, helpers) => {
  try {
    const result = await someAsyncOperation();
    await helpers.sendSSE({ result }, 'success');
  } catch (error) {
    // Send error event to client
    res.sendError(error, helpers.eventId());
  }
}));
```

### Client Error Handling

```javascript
eventSource.addEventListener('error', (event) => {
  if (event.readyState === EventSource.CLOSED) {
    console.log('Connection closed');
  } else {
    console.log('Connection error, will retry...');
  }
});

eventSource.addEventListener('error', (event) => {
  const data = JSON.parse(event.data);
  console.error('Server error:', data.error);
});
```

## Best Practices

1. **Always close connections** - Call `res.closeSSE()` when done
2. **Use appropriate event types** - Different event types for different data
3. **Include timestamps** - Helpers auto-add timestamps; useful for debugging
4. **Limit concurrent connections** - Consider connection pooling for high-traffic
5. **Error recovery** - Always include try-catch blocks
6. **Chunked data** - Stream large datasets in chunks
7. **Monitor keep-alive** - Adjust interval based on proxy timeout settings
8. **Test reconnection** - Verify client auto-reconnect behavior

## Troubleshooting

### Connection closes immediately
- Check if errors are thrown in event handler
- Verify headers aren't being overwritten
- Ensure `res.closeSSE()` isn't called prematurely

### Client not receiving events
- Verify event types match client listeners
- Check browser console for errors
- Ensure JSON data is valid
- Check CORS headers

### High memory usage
- Implement backpressure (pause sending)
- Chunk large datasets
- Close idle connections
- Monitor event accumulation

### Proxy timeouts
- Reduce `keepAliveInterval`
- Check proxy timeout settings
- Send more frequent keep-alive messages

## Migration from Callbacks to Async/Await

**Old (Callback-based):**
```javascript
function SSE(req, res, next) {
  // Setup...
}
```

**New (Async):**
```javascript
import { SSEMiddleware, withSSE } from './core/sse_middleware.js';

// Use as middleware
app.use(SSEMiddleware());

// Or with async handlers
app.get('/data', withSSE(async (req, res, helpers) => {
  await helpers.sendSSE({ data: 'value' });
}));
```

## Security Considerations

1. **CORS** - Middleware sets `Access-Control-Allow-Origin: *`; restrict as needed
2. **Authentication** - Add auth middleware before SSE middleware
3. **Rate Limiting** - Implement rate limits on SSE endpoints
4. **Data Validation** - Validate all data before sending to clients
5. **XSS Prevention** - Sanitize user input before streaming

## Performance Tips

- **Batch events** - Send multiple updates in one write
- **Compression** - Use gzip compression for text/event-stream
- **Connection limits** - Set max concurrent connections
- **Memory management** - Clear timers and cleanup resources
- **Buffer management** - Monitor Node.js buffer usage

---

For more examples, see `examples/sse_usage_example.js`
