# Console Component Documentation

## Overview

The `Console` component is a real-time log display component that connects to the server's EventSource (`/log` endpoint) and displays incoming messages in a styled console-like interface.

## Features

✨ **Real-time Logging**
- Automatically connects to EventSource and receives messages
- Displays logs as they arrive in real-time
- Auto-scrolls to latest message (toggle with checkbox)

✨ **Message Filtering**
- Filter by log type: All, Log, Error, Warn, Info
- Each filter shows only relevant messages
- Count statistics for errors and warnings

✨ **Visual Design**
- Monospace font styled like browser console
- Color-coded messages by type:
  - 🔴 Red for errors
  - 🟡 Yellow for warnings
  - 🔵 Blue for info
  - 🟣 Purple for debug
  - ⚪ Gray for logs
- Icons for quick visual identification
- Timestamps for each message

✨ **User Controls**
- **Expand/Collapse** - Toggle console visibility
- **Auto-scroll** - Toggle automatic scrolling to latest message
- **Clear** - Remove all logs from the console
- **Filter buttons** - Quick filter by message type

✨ **Statistics**
- Total log count
- Error count
- Warning count

## Component Structure

```typescript
export interface LogEntry {
  id: string                                    // Unique identifier
  type: 'log' | 'error' | 'warn' | 'info' | 'debug'  // Message type
  timestamp: Date                               // When message was received
  message: string                               // The message content
}
```

## State Management

```typescript
const [logs, setLogs] = useState<LogEntry[]>()           // All log entries
const [isExpanded, setIsExpanded] = useState(true)       // Console visibility
const [autoScroll, setAutoScroll] = useState(true)       // Auto-scroll toggle
const [filter, setFilter] = useState('all')              // Current filter
```

## Key Functions

### handleMessage(message: string)
Processes incoming EventSource messages:
- Attempts to parse JSON to extract message type
- Extracts `error`, `warning`, `info`, or `message` fields
- Falls back to plain text if not JSON
- Creates a LogEntry and adds to logs state

### filteredLogs
Computed logs based on current filter:
```typescript
const filteredLogs = logs.filter((log) =>
  filter === 'all' ? true : log.type === filter
)
```

### getTypeIcon(type: LogEntry['type'])
Returns SVG icon for the message type:
- Error: X circle icon
- Warn: Triangle icon
- Info: Info circle icon
- Debug: Debug icon
- Log: Comment bubble icon

### getTypeColor(type: LogEntry['type'])
Returns Tailwind color class for message text:
- Error: `text-red-300`
- Warn: `text-yellow-300`
- Info: `text-blue-300`
- Debug: `text-purple-300`
- Log: `text-gray-300`

### formatTime(date: Date)
Formats timestamp to HH:MM:SS format (12-hour with AM/PM)

## Message Format

The component expects messages in one of these formats:

### JSON Format
```javascript
// Error message
{ "error": "Something went wrong" }

// Warning message
{ "warning": "This might cause issues" }

// Info message
{ "info": "Operation completed" }

// General message
{ "message": "Log entry" }
```

### Plain Text Format
```javascript
"This is a simple text message"
```

## Usage Example

### In App.tsx
```typescript
import Console from './components/Console'

function App() {
  return (
    <div>
      {/* Other components */}
      <Console />
    </div>
  )
}
```

### Sending Messages from Server

Using the SSE middleware:
```javascript
app.get('/log', SSEMiddleware(), (req, res) => {
  res.sendSSE({ message: 'Application started' }, 'log');
  res.sendSSE({ info: 'Processing request' }, 'info');
  res.sendSSE({ error: 'Error occurred' }, 'error');
});
```

## Styling Details

### Console Container
- Background: `bg-black/50` - Semi-transparent black
- Border: `border-gray-700` - Dark gray border
- Padding: `p-3` - Comfortable spacing
- Height: `h-60` - Fixed height (240px)
- Overflow: `overflow-auto` - Scrollable content
- Font: `font-mono text-xs` - Monospace, small size

### Filter Buttons
- Active: `bg-blue-600 text-white`
- Inactive: `bg-gray-800 text-gray-300 hover:bg-gray-700`
- Clear button: `hover:bg-red-900/50 hover:text-red-300`

### Log Entries
- Hover effect: `hover:bg-gray-900/50`
- Padding: `py-1 px-1`
- Rounded: `rounded`
- Spacing between entries: `space-y-1`

## Component Props

The component takes no props and manages all state internally.

## Hooks Used

### useEventSource
Custom hook that connects to `/log` EventSource endpoint:
```typescript
useEventSource({ onmessage: handleMessage })
```

### useState
Manages:
- logs (array of LogEntry)
- isExpanded (boolean)
- autoScroll (boolean)
- filter (string)

### useCallback
Memoizes handleMessage to prevent unnecessary re-renders

### useRef
Maintains references to:
- logsEndRef - For auto-scroll functionality
- scrollContainerRef - For scroll container element

### useEffect
Auto-scroll effect when logs change or autoScroll setting changes

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Performance Considerations

### Log Limit
Currently no limit on stored logs. For long-running sessions, consider:
- Implementing a max log limit (e.g., 1000 entries)
- Clearing old logs automatically
- Lazy loading for display

Example implementation:
```typescript
// Keep only last 1000 logs
setLogs((prevLogs) => {
  const newLogs = [...prevLogs, newLog];
  return newLogs.slice(-1000);
});
```

### Memory Usage
- Each LogEntry: ~200 bytes
- 1000 logs: ~200 KB
- 10000 logs: ~2 MB

## Future Enhancements

1. **Export Logs**
   - Export as JSON or CSV
   - Copy logs to clipboard

2. **Persistent Storage**
   - Save logs to localStorage
   - Load previous session logs

3. **Search/Filter**
   - Text search within messages
   - Case-insensitive matching
   - Regex support

4. **Formatting**
   - Syntax highlighting for JSON
   - Expand/collapse objects
   - Pretty-print JSON

5. **Advanced Features**
   - Grouping by type or time
   - Timestamps (absolute/relative)
   - Log levels configuration
   - Network request/response logging

## Customization

### Change Console Height
```typescript
className="h-96"  // Change from h-60 (240px)
```

### Modify Colors
```typescript
// In getTypeColor function
case 'error':
  return 'text-red-500'  // Change from text-red-300
```

### Change Scrollbar Style
```typescript
// Update scrollbar Tailwind config for custom styling
className="scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
```

## Troubleshooting

### Messages Not Appearing
1. Check if EventSource is connecting to `/log` endpoint
2. Verify server is sending messages with correct format
3. Check browser console for JavaScript errors
4. Ensure useEventSource hook is initialized

### Auto-scroll Not Working
1. Check if `autoScroll` checkbox is enabled
2. Verify `logsEndRef` is being set correctly
3. Check scrollable container height

### Performance Issues
1. Implement log limit (see Performance Considerations)
2. Clear logs periodically
3. Consider virtual scrolling for large log lists

## Testing

### Manual Testing
1. Start the application
2. Execute a script
3. Observe messages appearing in console in real-time
4. Test filtering by clicking filter buttons
5. Test auto-scroll toggle
6. Test clear button

### Example Server Messages
```javascript
// Send in your route handler
res.sendSSE({ message: 'Script execution started' }, 'log');
res.sendSSE({ info: 'Browser initialized' }, 'info');
res.sendSSE({ warning: 'Slow connection detected' }, 'warn');
res.sendSSE({ error: 'Script failed' }, 'error');
```

---

## Files Related

- Component: `frontend/src/components/Console.tsx`
- Hook: `frontend/src/hooks/useEventSource.ts`
- Server Endpoint: `/log` (SSE endpoint)
- Utilities: `frontend/src/lib/utils.ts`

## Integration Checklist

- [ ] Component is imported in App.tsx
- [ ] EventSource hook is properly initialized
- [ ] Server `/log` endpoint is set up
- [ ] Message format matches expected JSON structure
- [ ] Tailwind CSS is configured with scrollbar plugin
- [ ] Component is styled and visible
- [ ] Messages are displaying in real-time
- [ ] Filtering works correctly
- [ ] Auto-scroll functions properly
