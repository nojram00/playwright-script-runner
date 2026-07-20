# SSE Middleware Integration Example

This document shows how to integrate the new async SSE middleware into the existing Playwright Script Runner application.

## Current Setup (app.js)

The current app only supports JSON responses. Here's how to add SSE streaming support:

## Option 1: Add SSE Endpoint for Script Execution

Add this to your `app.js`:

```javascript
import { SSEMiddleware, withSSE } from "./core/sse_middleware.js";

// Existing imports and setup...

// ============================================================================
// NEW: Add SSE endpoint for streaming script execution
// ============================================================================

app.post('/execute-stream', withSSE(async (req, res, helpers) => {
  try {
    let script = null;
    
    // Handle raw text/plain (JavaScript code)
    if (typeof req.body === 'string') {
      script = req.body;
    }
    // Handle JSON with 'script' or 'code' field
    else if (typeof req.body === 'object' && req.body !== null) {
      script = req.body.script || req.body.code;
    }
    
    if (!script || script.trim().length === 0) {
      res.sendError('Script body is required');
      return;
    }

    // Send execution start event
    await helpers.sendSSE(
      { status: 'started', script: script.substring(0, 100) + '...' },
      'execution_start'
    );

    // Execute the script
    const result = await executeScript(script);

    // Send result event
    await helpers.sendSSE(
      { status: 'completed', result: result },
      'execution_result'
    );

  } catch (error) {
    console.error('POST /execute-stream error:', error.message);
    res.sendError(error);
  }
}, { maxRetries: 3, timeout: 60000 }));
```

## Option 2: Add SSE Middleware Globally

Apply SSE middleware to all routes for advanced tracking:

```javascript
import { SSEMiddleware } from "./core/sse_middleware.js";

// Add middleware with callbacks
app.use(SSEMiddleware({
  keepAliveInterval: 30000,
  onConnect: (req, res) => {
    console.log(`Client connected: ${req.ip} - ${req.path}`);
  },
  onDisconnect: (req, res) => {
    console.log(`Client disconnected: ${req.ip} - ${req.path}`);
  }
}));
```

## Option 3: SSE Stream with Progress Events

For more detailed execution events:

```javascript
app.post('/execute-stream-verbose', withSSE(async (req, res, helpers) => {
  try {
    let script = null;
    
    if (typeof req.body === 'string') {
      script = req.body;
    } else if (typeof req.body === 'object' && req.body !== null) {
      script = req.body.script || req.body.code;
    }
    
    if (!script) {
      res.sendError('Script required');
      return;
    }

    // Event 1: Validation
    await helpers.sendSSE(
      { stage: 'validation', message: 'Validating script syntax...' },
      'status'
    );
    
    // Simulate validation
    await new Promise(r => setTimeout(r, 500));

    // Event 2: Browser setup
    await helpers.sendSSE(
      { stage: 'browser_setup', message: 'Initializing browser...' },
      'status'
    );

    // Execute script
    const result = await executeScript(script);

    // Event 3: Execution complete
    await helpers.sendSSE(
      { 
        stage: 'complete', 
        message: 'Execution completed successfully',
        result: result,
        executionTime: new Date().toISOString()
      },
      'execution_complete'
    );

  } catch (error) {
    console.error('Execution error:', error);
    res.sendError(error);
  }
}));
```

## Frontend Integration

Update your frontend to use SSE streams instead of just HTTP responses:

### React Hook for SSE

```javascript
// hooks/useSSE.js
import { useState, useEffect, useCallback } from 'react';

export function useSSE(url) {
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(() => {
    try {
      const eventSource = new EventSource(url);
      setIsConnected(true);
      setError(null);
      setEvents([]);

      eventSource.addEventListener('execution_start', (event) => {
        setEvents(prev => [...prev, { type: 'start', data: JSON.parse(event.data) }]);
      });

      eventSource.addEventListener('status', (event) => {
        setEvents(prev => [...prev, { type: 'status', data: JSON.parse(event.data) }]);
      });

      eventSource.addEventListener('execution_result', (event) => {
        setEvents(prev => [...prev, { type: 'result', data: JSON.parse(event.data) }]);
      });

      eventSource.addEventListener('error', (event) => {
        const errorData = JSON.parse(event.data);
        setError(errorData.error);
        setIsConnected(false);
        eventSource.close();
      });

      eventSource.addEventListener('close', () => {
        setIsConnected(false);
        eventSource.close();
      });

      return eventSource;
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    }
  }, [url]);

  return { events, isConnected, error, connect };
}
```

### Updated App Component

```javascript
// App.tsx
import { useSSE } from './hooks/useSSE';

export function App() {
  const { events, isConnected, error, connect } = useSSE('/execute-stream-verbose');

  const handleExecute = async () => {
    const eventSource = connect();
    
    // POST the script
    fetch('/execute-stream-verbose', {
      method: 'POST',
      body: code,
      headers: { 'Content-Type': 'text/plain' }
    });
  };

  return (
    <div>
      {/* Existing UI */}
      
      {/* Event Stream Display */}
      <div className="event-log">
        {events.map((event, i) => (
          <div key={i} className={`event event-${event.type}`}>
            <pre>{JSON.stringify(event.data, null, 2)}</pre>
          </div>
        ))}
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## Comparison: Old vs New

### Old (HTTP JSON):
```javascript
// Client sends request
POST /test -> Server -> Response: { result: {...} }
// Done
```

### New (SSE Stream):
```javascript
// Client sends request and opens event stream
POST /execute-stream -> Server -> Event: 'execution_start'
                                  Event: 'status' (browser setup)
                                  Event: 'status' (execution)
                                  Event: 'execution_result' { result: {...} }
                                  Connection closes
```

## Benefits of SSE Integration

1. **Real-time Updates** - Progress shown as it happens
2. **Better UX** - Users see what's happening during execution
3. **Error Recovery** - Client auto-reconnects on disconnect
4. **Scalability** - One connection per client, no polling
5. **Low Overhead** - Text-based protocol, minimal bandwidth

## Testing

### Using cURL to test SSE:
```bash
# Connect to SSE endpoint
curl -N http://localhost:8089/execute-stream-verbose \
  -X POST \
  -H "Content-Type: text/plain" \
  -d "console.log('test')"
```

### Using JavaScript:
```javascript
const eventSource = new EventSource('/execute-stream-verbose');

eventSource.addEventListener('execution_start', (e) => {
  console.log('Started:', JSON.parse(e.data));
});

eventSource.addEventListener('status', (e) => {
  console.log('Status:', JSON.parse(e.data));
});

eventSource.addEventListener('execution_result', (e) => {
  console.log('Result:', JSON.parse(e.data));
  eventSource.close();
});

eventSource.addEventListener('error', (e) => {
  console.error('Error:', e);
});
```

## Production Considerations

1. **Connection Limits** - Set reasonable limits on concurrent SSE connections
2. **Timeout Settings** - Adjust keep-alive interval based on infrastructure
3. **Error Handling** - Gracefully handle disconnects and reconnects
4. **Monitoring** - Track active connections and performance metrics
5. **Security** - Add authentication before SSE endpoints
6. **Load Balancing** - Configure sticky sessions for SSE connections

## Migration Path

1. Add SSE endpoint alongside existing `/test` endpoint
2. Update frontend to support both old and new modes
3. Gradually migrate clients to use SSE
4. Monitor performance and stability
5. Deprecate old endpoint after migration complete

---

For more details, see `SSE_MIDDLEWARE_GUIDE.md`
