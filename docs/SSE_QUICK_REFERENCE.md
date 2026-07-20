# SSE Middleware - Quick Reference Card

## Import
```javascript
import { SSEMiddleware, withSSE } from './core/sse_middleware.js';
```

## Setup

### Middleware
```javascript
// Global
app.use(SSEMiddleware());

// Route-specific
app.get('/events', SSEMiddleware(), (req, res) => { ... });

// With options
app.use(SSEMiddleware({
  keepAliveInterval: 30000,
  maxRetries: 3,
  onConnect: (req, res) => console.log('Connected'),
  onDisconnect: (req, res) => console.log('Disconnected'),
}));
```

### Async Handler
```javascript
app.post('/stream', withSSE(async (req, res, helpers) => {
  await helpers.sendSSE({ data: 'value' }, 'event_type');
}));
```

## Response Methods

| Method | Usage |
|--------|-------|
| `res.sendSSE(data, type?, id?)` | Send event `{ "id": 1, "event": "type", "data": {...} }` |
| `res.sendError(error, id?)` | Send error event |
| `res.sendRetry(ms?)` | Request retry after N ms |
| `res.sendComment(text?)` | Send comment (keep-alive) |
| `res.closeSSE(reason?)` | Close connection |

## Examples

### Simple Event
```javascript
res.sendSSE({ name: 'John' }, 'user');
// Output:
// event: user
// data: {"name":"John"}
//
```

### Event with ID
```javascript
res.sendSSE({ count: 5 }, 'tick', 1);
// Output:
// id: 1
// event: tick
// data: {"count":5}
//
```

### Error Event
```javascript
res.sendError(new Error('Something failed'), 1);
// Output:
// id: 1
// event: error
// data: {"error":"Something failed","timestamp":"..."}
//
```

### Retry
```javascript
res.sendRetry(5000); // Retry in 5 seconds
// Output:
// retry: 5000
//
```

## Async Handler Pattern

```javascript
app.post('/long-operation', withSSE(async (req, res, helpers) => {
  try {
    await helpers.sendSSE({ status: 'starting' }, 'status');
    
    const result = await doSomethingAsync();
    
    await helpers.sendSSE({ result }, 'complete');
  } catch (error) {
    res.sendError(error); // Sends to client, closes connection
  }
  // Connection auto-closes after handler returns
}));
```

## Client-Side (Browser)

```javascript
const eventSource = new EventSource('/events');

// Listen to specific event type
eventSource.addEventListener('user', (event) => {
  const data = JSON.parse(event.data);
  console.log(data.name);
});

// Listen to all events
eventSource.addEventListener('message', (event) => {
  console.log('Message:', event.data);
});

// Handle errors
eventSource.addEventListener('error', (event) => {
  console.error('Connection error:', event);
  eventSource.close();
});

// Close when done
eventSource.close();
```

## Common Patterns

### Progress Tracking
```javascript
app.get('/progress', withSSE(async (req, res, helpers) => {
  for (let i = 0; i <= 100; i += 10) {
    await helpers.sendSSE({ percent: i }, 'progress');
    await sleep(500);
  }
}));
```

### Streaming Results
```javascript
app.post('/execute', withSSE(async (req, res, helpers) => {
  await helpers.sendSSE({ status: 'running' }, 'status');
  const result = await executeScript(req.body);
  await helpers.sendSSE({ result }, 'result');
}));
```

### Chunked Data
```javascript
app.get('/data', withSSE(async (req, res, helpers) => {
  const items = Array.from({ length: 10000 }, (_, i) => i);
  for (let i = 0; i < items.length; i += 100) {
    await helpers.sendSSE({
      items: items.slice(i, i + 100),
      progress: ((i + 100) / items.length) * 100
    }, 'chunk');
  }
}));
```

## Testing

### With cURL
```bash
curl -N http://localhost:8089/events
```

### With Node.js
```javascript
const response = await fetch('/events');
const reader = response.body.getReader();
const decoder = new TextDecoder();

const { value } = await reader.read();
console.log(decoder.decode(value));
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection closes immediately | Add error handling in try-catch |
| Client not receiving events | Check event type matches listener |
| High memory usage | Implement backpressure/chunking |
| Proxy timeout | Reduce `keepAliveInterval` |

## Integration Steps

1. Import middleware: `import { SSEMiddleware, withSSE } from './core/sse_middleware.js'`
2. Apply to routes: `app.post('/stream', withSSE(handler))`
3. Send events: `await helpers.sendSSE(data, 'type')`
4. Handle client-side: `new EventSource('/stream')`
5. Test with cURL or browser dev tools

## Files

- **Implementation**: `core/sse_middleware.js` (260 lines)
- **Full Guide**: `SSE_MIDDLEWARE_GUIDE.md` (480 lines)
- **Integration**: `SSE_INTEGRATION_EXAMPLE.md` (312 lines)
- **Examples**: `examples/sse_usage_example.js` (245 lines)
- **Summary**: `SSE_IMPLEMENTATION_SUMMARY.md` (243 lines)

---

**Need help?** Check the full guide at `SSE_MIDDLEWARE_GUIDE.md`
