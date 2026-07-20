# Playwright Chromium Launch Error - Root Cause & Solution

## Error
```
Error: spawn /root/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell ENOENT
```

## Root Cause Analysis

**ENOENT** = "Error: No Entry" - The Chromium binary file doesn't exist at the expected path.

### Three Issues:

1. **Missing Chromium Binary**
   - Playwright browsers were not downloaded during Docker build
   - The binary cache was not available in the runtime container

2. **Missing System Dependencies**
   - Alpine Linux lacks many system libraries required by Chromium
   - Libraries like `libxss`, `nss`, `nspr`, `libxcb`, etc. are needed
   - Without these, even if the binary exists, it cannot execute

3. **Incorrect Installation Command**
   - Using `npx playwright install chromium` without `--with-deps` flag
   - The `--with-deps` flag automatically installs required system packages on Alpine

## Solution

### Updated Dockerfile (Stage 2):

1. **Install System Dependencies**
   ```dockerfile
   RUN apk add --no-cache \
       ca-certificates nss nspr libxss cups mesa-gl libatk \
       libxcb libxkbcommon libxcomposite libxdamage libxrandr \
       libxinerama libdbus
   ```

2. **Install Playwright with Dependencies**
   ```dockerfile
   RUN npx playwright install chromium --with-deps
   ```

### Key Changes:
- ✅ Added `apk add` for system libraries
- ✅ Used `--with-deps` flag with playwright install
- ✅ Moved Playwright installation after dependencies copy (proper layer caching)
- ✅ Placed system package install before npm install

## Result

When the Docker image builds:
1. System dependencies are installed via apk
2. Node dependencies are installed via npm
3. Playwright downloads Chromium binary and installs its dependencies
4. Chromium binary is available at runtime on `/test` endpoint calls

The `/test` endpoint will now successfully launch the browser and execute scripts.
