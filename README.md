# Playwright Script Runner

A web-based script runner that runs with playwright backend and express.

Just Paste the code snippet and run.

---

## Prequisites
- Install the following dependencies from both server and frontend.

```bash
npm install # install main server dependencies

cd frontend && npm install # install frontend dependencies
```

- From the `frontend` directory, simply run build file using this command:
```bash
npm run build # make sure you're in `frontend` folder!
```

- Once the frontend assets are build, return to the main project directory. Run the following command to start server:

```bash
npm start

# or 

npm run dev # if you want in dev mode.

```

- Once running, navigate to `localhost:8089` the begin executing test scripts!

---

## Docker Installation

### Using Docker

Pull and run the Docker image from Docker Hub:

```bash
docker run -p 8089:8089 nojram/web-script-runner:latest
```

Then navigate to `localhost:8089` to begin executing test scripts.

**Available tags:**
- `latest` - Latest stable version
- `dev` - Development version (if available)

### Using Docker Compose

Create a `docker-compose.yml` file in your project directory:

```yaml
version: '3.8'

services:
  web-script-runner:
    image: nojram/web-script-runner:latest
    ports:
      - "8089:8089"
    environment:
      - NODE_ENV=production
    # Optional: uncomment for dev mode
    # environment:
    #   - NODE_ENV=development
```

Start the service:

```bash
docker-compose up -d
```

View logs:

```bash
docker-compose logs -f web-script-runner
```

Stop the service:

```bash
docker-compose down
```

Once running, navigate to `localhost:8089` to begin executing test scripts.

**Docker Hub Repository:** https://hub.docker.com/repository/docker/nojram/web-script-runner/general

---

## Script Template
- Executed scripts requires to run in an IFEE with a return value in order to send a result as response.

### Example snippet

```js

/**
 * NOTE: Recommended to use IFEE with return values to print results.
 * 
 * @param browser - The main browser context created by playwright browser.
 * @param close - callback for closing browser and its context.
 * 
 * This script allows users to use 'HELPER' constant for additional helper functions like parsing urls.
 **/
(async (browser, close) => {
  const page = await browser.newPage()
  
  await page.goto('https://example.com')
  
  const title = await page.title()
  console.log('Page title:', title)
  
  await close()
  return { title }
})(browser, close)

```

- The scripts executed are run via node's `vm` module which added the playwright's browser as a context. In addition to that, script runner also provided a helper functions, accessible via `HELPERS` constant.
    - Here are the available helper functions:
        - `url_create` - a helper tool that returns a string to a new `URL` object

#### Usage:
```js
const url = HELPERS.url_create("https://example.com?example=test")

console.log(url.origin) // https://example.com
console.log(Object.fromEntries(url.searchParams)) // { example: "test" }
```

**Stay tuned as there are more helper functions to be implemented.**

---