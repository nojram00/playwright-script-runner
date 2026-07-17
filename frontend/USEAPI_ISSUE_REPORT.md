# useApi Hook Issue Analysis

## Problem Identified

### 404 Error with "Script body is required"

The error message indicates a **400 Bad Request** (not 404), which comes from the backend endpoint when the request body is empty or invalid.

### Root Cause

**Line 15: Incorrect Content-Type Header**

```typescript
headers : {
    "Content-Type" : "application/text"  // ❌ WRONG
},
```

### Why It's Failing

1. **Wrong MIME Type**: `application/text` is not a standard MIME type
2. **Backend Expectation**: The backend is configured to accept:
   - `text/plain` 
   - `application/javascript`
   - `application/json`

3. **Result**: The Express middleware doesn't parse the body correctly because of the unrecognized Content-Type
4. **Consequence**: `req.body` arrives as `undefined` or empty
5. **Backend Response**: Returns 400 with "Script body is required"

## Solution

Change the Content-Type header to one of the accepted types:

### Option 1: Use `application/javascript` (Recommended)
```typescript
headers : {
    "Content-Type" : "application/javascript"  // ✅ Correct
},
```

### Option 2: Use `text/plain`
```typescript
headers : {
    "Content-Type" : "text/plain"  // ✅ Also works
},
```

### Current Backend Configuration (app.js)
```typescript
app.use(express.text({ type: ['text/plain', 'application/javascript'] }))
```

The backend is configured to accept both `text/plain` and `application/javascript`, but not `application/text`.

## Fix Required

Update line 15 in `useApi.ts`:
```typescript
// Change from:
"Content-Type" : "application/text"

// To:
"Content-Type" : "application/javascript"
```

This will allow the Express middleware to properly parse the request body, and the backend will receive the script correctly.
