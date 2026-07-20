# Console Component Integration Guide

## Quick Start

### 1. The Component is Already in Your App

The Console component is already imported in `App.tsx`:

```typescript
import Console from './components/Console'

function App() {
  return (
    <div>
      {/* Code Editor */}
      <div className="lg:col-span-2">
        {/* ... editor code ... */}
      </div>

      {/* Output Display */}
      <OutputDisplay {...props} />

      {/* Console - NEW */}
      <Console />
    </div>
  )
}
```

### 2. How It Works

The Console component:
1. Connects to `/log` EventSource endpoint on mount
2. Listens for incoming messages
3. Parses JSON or plain text
4. Displays in styled console interface
5. Filters, auto-scrolls, and tracks statistics

### 3. Server Setup

Your server needs a `/log` endpoint using SSE middleware:

```javascript
import { withSSE } from './core/sse_middleware.js';

app.get('/log', withSSE(async (req, res, helpers) => {
  // Send log messages to connected clients
  await helpers.sendSSE({ message: 'Server started' }, 'log');
}));
```

## Message Format

Send messages from your server in this format:

### Error Message
```javascript
res.sendSSE({ error: 'Something went wrong' }, 'error');
// or
await helpers.sendSSE({ error: 'Script failed' }, 'error');
```

### Warning Message
```javascript
res.sendSSE({ warning: 'Connection timeout' }, 'warn');
// or
await helpers.sendSSE({ warning: 'Low memory' }, 'warn');
```

### Info Message
```javascript
res.sendSSE({ info: 'Operation completed' }, 'info');
// or
await helpers.sendSSE({ info: 'Process finished' }, 'info');
```

### Log Message
```javascript
res.sendSSE({ message: 'Regular log entry' }, 'log');
// or
res.sendSSE({ message: 'User logged in' });
```

### Plain Text
```javascript
res.sendSSE('Simple text message');
```

## Integration with Script Execution

Here's how to use Console with the script execution endpoint:

### Backend (app.js)

```javascript
import { withSSE } from './core/sse_middleware.js';
import { executeScript } from './core/script_runner.js';

app.post('/execute-with-logs', withSSE(async (req, res, helpers) => {
  const script = req.body;

  try {
    // Send start event
    await helpers.sendSSE({ message: 'Script execution started' }, 'log');
    
    // Send status update
    await helpers.sendSSE({ info: 'Initializing browser...' }, 'info');
    
    // Execute the script
    const result = await executeScript(script);
    
    // Send completion
    await helpers.sendSSE({ info: 'Script completed' }, 'info');
    await helpers.sendSSE({ message: `Result: ${JSON.stringify(result)}` }, 'log');
    
  } catch (error) {
    // Send error event
    await helpers.sendSSE({ error: error.message }, 'error');
  }
}));
```

### Frontend (App.tsx)

```typescript
import Console from './components/Console'

function App() {
  const [code, setCode] = useState(defaultScript);
  const { sendScript, isLoading } = useApi();

  const handleExecute = async () => {
    // Send script to execute-with-logs endpoint
    await fetch('/execute-with-logs', {
      method: 'POST',
      body: code,
      headers: { 'Content-Type': 'text/plain' }
    });
  };

  return (
    <div>
      {/* ... */}
      <Console /> {/* Shows logs in real-time */}
    </div>
  );
}
```

## Console Features Walkthrough

### Feature 1: Expand/Collapse
```
Click the down arrow button in the header to collapse/expand the console
```

### Feature 2: Filter Messages
```
Click filter buttons: All | Log | Error | Warn | Info
Shows only messages of selected type
```

### Feature 3: Auto-Scroll
```
Check "Auto-scroll" to automatically scroll to latest message
Uncheck to manually scroll through logs
```

### Feature 4: Clear Logs
```
Click "Clear" button to remove all logs
Useful for starting fresh tests
```

### Feature 5: Log Statistics
```
Shows at bottom:
- Total: count of all logs
- Errors: count of error messages
- Warnings: count of warning messages
```

## Styling Reference

### Console Container Appearance
```
┌─────────────────────────────────────┐
│ Console                        [↓]  │  ← Header with toggle
├─────────────────────────────────────┤
│ [All] [Log] [Error] [Warn] [Info]   │  ← Filter buttons
│                                [✓] Auto-scroll [Clear]
├─────────────────────────────────────┤
│ 14:23:45 ⓘ Script execution started │
│ 14:23:46 ℹ Initializing browser...  │  ← Log entries with timestamps
│ 14:23:47 ✓ Browser initialized      │
│ 14:23:48 ℹ Executing script...      │
│ 14:23:51 ✓ Script completed         │
│ 14:23:52 ✗ Error: Connection failed │
│                                     │  ← Scrollable area
├─────────────────────────────────────┤
│ Total: 6  Errors: 1  Warnings: 0    │  ← Statistics
└─────────────────────────────────────┘
```

### Color Coding
- 🔴 Red (#fca5a5) - Error messages
- 🟡 Yellow (#fcd34d) - Warning messages
- 🔵 Blue (#93c5fd) - Info messages
- 🟣 Purple (#d8b4fe) - Debug messages
- ⚪ Gray (#d1d5db) - Log messages

## Advanced Usage

### Example 1: Stream Progress Updates

```javascript
// Server
app.post('/long-task', withSSE(async (req, res, helpers) => {
  for (let i = 0; i <= 100; i += 10) {
    await helpers.sendSSE({
      message: `Progress: ${i}%`
    }, 'log');
    await new Promise(r => setTimeout(r, 500));
  }
}));
```

### Example 2: Different Log Levels

```javascript
// Server
app.get('/multi-level', withSSE(async (req, res, helpers) => {
  await helpers.sendSSE({ info: 'Starting operation' }, 'info');
  await helpers.sendSSE({ message: 'Processing item 1' }, 'log');
  await helpers.sendSSE({ warning: 'Item 2 is slow' }, 'warn');
  await helpers.sendSSE({ message: 'Processing item 3' }, 'log');
  await helpers.sendSSE({ error: 'Item 4 failed' }, 'error');
  await helpers.sendSSE({ info: 'Operation finished' }, 'info');
}));
```

### Example 3: Structured Logging

```javascript
// Server
const sendLog = async (res, helpers, level, message, data) => {
  const payload = {
    [level]: `${message}${data ? ' - ' + JSON.stringify(data) : ''}`
  };
  await helpers.sendSSE(payload, level === 'error' ? 'error' : 'log');
};

app.post('/task', withSSE(async (req, res, helpers) => {
  await sendLog(res, helpers, 'info', 'Task started');
  await sendLog(res, helpers, 'log', 'User logged in', { userId: 123 });
  await sendLog(res, helpers, 'warn', 'Low disk space', { available: '100MB' });
  await sendLog(res, helpers, 'info', 'Task completed');
}));
```

## Testing the Console

### Test 1: Manual Message Sending
```bash
# Create a test endpoint
curl -N http://localhost:8089/test-logs
```

### Test 2: Using Browser DevTools
```javascript
// In browser console, connect to test endpoint
const es = new EventSource('/test-logs');
es.addEventListener('message', (e) => {
  console.log('Received:', e.data);
});
```

### Test 3: Multiple Log Types
```javascript
// Send various message types
res.sendSSE({ message: 'Log entry' }, 'log');
res.sendSSE({ info: 'Info entry' }, 'info');
res.sendSSE({ warning: 'Warning entry' }, 'warn');
res.sendSSE({ error: 'Error entry' }, 'error');
```

## Performance Tips

### Handling Large Number of Logs
```typescript
// In Console.tsx, add a log limit
const MAX_LOGS = 1000;
setLogs((prevLogs) => {
  const newLogs = [...prevLogs, newLog];
  return newLogs.slice(-MAX_LOGS);
});
```

### Batch Processing
```javascript
// Send multiple logs as batch
app.post('/batch-logs', withSSE(async (req, res, helpers) => {
  const logs = [
    { message: 'Log 1' },
    { info: 'Info 1' },
    { warning: 'Warn 1' }
  ];
  
  for (const log of logs) {
    await helpers.sendSSE(log, 'log');
  }
}));
```

## Troubleshooting

### Console Not Showing
- [ ] Verify Console component is imported in App.tsx
- [ ] Check browser DevTools for JavaScript errors
- [ ] Ensure component renders in the grid layout

### Messages Not Appearing
- [ ] Verify `/log` endpoint exists on server
- [ ] Check EventSource connection in browser DevTools (Network tab)
- [ ] Verify message format matches expected structure
- [ ] Check browser console for EventSource errors

### Auto-Scroll Not Working
- [ ] Ensure "Auto-scroll" checkbox is checked
- [ ] Verify scroll container has correct height
- [ ] Check for CSS issues with overflow

### Performance Issues
- [ ] Check number of logs (may need to implement limit)
- [ ] Monitor memory usage in DevTools
- [ ] Consider clearing old logs automatically

## Integration Checklist

- [ ] Console component is in App.tsx
- [ ] useEventSource hook connects to `/log`
- [ ] Server has `/log` endpoint with SSE middleware
- [ ] Messages are sent in correct JSON format
- [ ] Console displays messages in real-time
- [ ] Filter buttons work correctly
- [ ] Auto-scroll toggle functions
- [ ] Clear button removes logs
- [ ] Timestamps are formatted correctly
- [ ] Color coding appears correctly

## API Reference

### Message Types

| Type | Color | Icon | Usage |
|------|-------|------|-------|
| error | Red | ✗ | errors, exceptions |
| warn | Yellow | ⚠ | warnings, issues |
| info | Blue | ℹ | informational |
| debug | Purple | ⚙ | debugging |
| log | Gray | 💬 | general logs |

### Filter Options

| Filter | Shows |
|--------|-------|
| All | All messages |
| Log | Only log messages |
| Error | Only errors |
| Warn | Only warnings |
| Info | Only info messages |

## Next Steps

1. ✅ Review the Console component code
2. ✅ Understand the message format
3. ✅ Set up `/log` endpoint with SSE
4. ✅ Send test messages from server
5. ✅ Verify console displays correctly
6. ✅ Test all features (filter, scroll, clear)
7. ✅ Integrate with your logging system

---

For more details, see `CONSOLE_COMPONENT.md`
