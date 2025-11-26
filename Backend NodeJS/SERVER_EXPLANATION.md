# Web Server Code Explanation (For Junior Devs! 🚀)

## The Big Picture
This code creates a **web server** - think of it like a restaurant that:
- **Listens** for incoming requests (customers ordering)
- **Processes** what they want (reading the menu)
- **Responds** with the right information (serving food)

---

## Part 1: Setting Up the Tools (Lines 1-9)

```javascript
import http from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
```

**What's happening:**
- We're importing "tools" (called modules) that Node.js gives us
- `http` - lets us create a web server
- `path` - helps us work with file/folder paths
- `url` - helps us work with URLs
- `fs` (file system) - lets us read/write files

**The `__dirname` setup (Lines 8-9):**
- In older Node.js, `__dirname` was automatic
- With ES6 modules (the `import` style), we need to create it ourselves
- It tells us: "Where is THIS file located on the computer?"
- We need this later to find files relative to our code

---

## Part 2: Creating the Server (Line 12)

```javascript
const server = http.createServer(async (req, res) => {
```

**Breaking this down:**
- `http.createServer()` - Creates a server instance
- `async` - Means this function can "wait" for things (like reading files)
- `req` (request) - Contains information about what the user asked for
  - `req.url` - The URL they visited
  - `req.method` - GET, POST, etc.
  - `req.headers.host` - The domain name
- `res` (response) - What we send back to the user
  - `res.writeHead()` - Sets the status code and headers
  - `res.end()` - Sends the final response

**Think of it like this:**
- Customer (browser) walks in: `req`
- Waiter (your code) processes the order
- Kitchen prepares food (your code does work)
- Waiter serves food: `res`

---

## Part 3: Parsing the URL (Lines 30-42)

This is the NEW part we just added!

### What is URL Parsing?
When someone visits: `http://localhost:3000/api?category=electronics&limit=5`

**The URL has 3 parts:**
1. **Protocol & Domain**: `http://localhost:3000`
2. **Path**: `/api` (the route/page they want)
3. **Query Parameters**: `?category=electronics&limit=5` (extra information)

### Line 30: Creating the URL Object
```javascript
const url = new URL(req.url, `http://${req.headers.host}`);
```

**Why this looks weird:**
- `req.url` only gives us `/api?category=electronics` (no domain)
- The `URL` class needs a complete URL to work
- So we add `http://localhost:3000` (or whatever domain)
- Now it's a complete URL: `http://localhost:3000/api?category=electronics`

**The `URL` class automatically breaks it into pieces:**
- `url.pathname` = `/api`
- `url.searchParams` = `{ category: "electronics", limit: "5" }`

### Line 34: Getting the Path
```javascript
const pathName = url.pathname;
```
This tells us **which route** they want:
- `/` = home page
- `/api` = API endpoint
- `/products` = products page (if you added it)

### Line 42: Getting Query Parameters
```javascript
const queryParams = Object.fromEntries(url.searchParams);
```

**What's `url.searchParams`?**
- It's a special object called `URLSearchParams`
- It has methods like `.get("category")` which is annoying to use
- `Object.fromEntries()` converts it to a regular object
- Now we can use `queryParams.category` instead of `queryParams.get("category")`

**Before (annoying):**
```javascript
const category = url.searchParams.get("category");
const limit = url.searchParams.get("limit");
```

**After (nice!):**
```javascript
const category = queryParams.category;
const limit = queryParams.limit;
```

---

## Part 4: Routing (Lines 48-111)

**Routing** = deciding what to show based on the URL path.

### Route 1: Home Page (`/`)
```javascript
if (pathName === "/") {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`<html>...</html>`);
}
```

**What happens:**
- If they visit `http://localhost:3000/`
- Send a 200 status (OK, everything worked)
- Tell browser: "This is HTML content"
- Send back the HTML string

### Route 2: API Endpoint (`/api`)
```javascript
else if (pathName === "/api") {
  // Read data from file
  // Apply filters if query params exist
  // Send JSON response
}
```

**Step by step:**

1. **Read the data file** (Line 65):
   ```javascript
   const data = await fs.readFile(join(__dirname, "data.json"), "utf-8");
   ```
   - `join(__dirname, "data.json")` - Finds the file in the same folder
   - `await` - Waits for the file to be read (this is why we use `async`)
   - `"utf-8"` - Tells it to read as text (not binary)

2. **Parse JSON** (Line 66):
   ```javascript
   let productData = JSON.parse(data);
   ```
   - The file contains text like `{"products": [...]}`
   - `JSON.parse()` converts it to a JavaScript object/array

3. **Apply filters using query parameters** (Lines 86-98):
   ```javascript
   if (queryParams.category) {
     productData = productData.filter(item => item.category === queryParams.category);
   }
   ```
   - **If** they provided a category (like `?category=electronics`)
   - **Then** filter the array to only show items matching that category
   - `.filter()` creates a new array with only matching items

   ```javascript
   if (queryParams.limit) {
     productData = productData.slice(0, parseInt(queryParams.limit));
   }
   ```
   - **If** they provided a limit (like `?limit=5`)
   - **Then** take only the first 5 items
   - `parseInt()` converts the string "5" to the number 5
   - `.slice(0, 5)` gets items at positions 0, 1, 2, 3, 4

4. **Send the response** (Lines 100-101):
   ```javascript
   res.writeHead(200, { "Content-Type": "application/json" });
   res.end(JSON.stringify(productData));
   ```
   - 200 status = success
   - Tell browser: "This is JSON data"
   - `JSON.stringify()` converts JavaScript object back to JSON text
   - Send it to the user

5. **Error handling** (Lines 102-105):
   ```javascript
   catch (error) {
     res.writeHead(404, { "Content-Type": "application/json" });
     res.end(JSON.stringify({ error: "Data file not found" }));
   }
   ```
   - If something goes wrong (file doesn't exist, etc.)
   - Send 404 status (not found)
   - Send a friendly error message

### Route 3: 404 (Everything Else)
```javascript
else {
  res.writeHead(404, { "Content-Type": "text/html" });
  res.end("<h1>404 - Page Not Found</h1>");
}
```
- If they visit a route we don't recognize
- Send 404 status
- Show "Page Not Found" message

---

## Part 5: Starting the Server (Lines 114-118)

```javascript
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
```

**What happens:**
- Define which port to listen on (3000)
- `server.listen()` starts the server
- The callback function runs when server is ready
- Log a message so you know it's working!

---

## Real-World Examples

### Example 1: Simple Request
**User visits:** `http://localhost:3000/api`

**What happens:**
1. Parse URL → `pathName = "/api"`, `queryParams = {}`
2. Match route → `/api`
3. Read `data.json`
4. No filters applied
5. Return ALL products

### Example 2: With Query Parameters
**User visits:** `http://localhost:3000/api?category=electronics&limit=3`

**What happens:**
1. Parse URL → `pathName = "/api"`, `queryParams = { category: "electronics", limit: "3" }`
2. Match route → `/api`
3. Read `data.json`
4. Filter: Only show electronics
5. Limit: Take first 3 results
6. Return 3 electronics items

### Example 3: Home Page
**User visits:** `http://localhost:3000/`

**What happens:**
1. Parse URL → `pathName = "/"`, `queryParams = {}`
2. Match route → `/`
3. Return HTML home page

---

## Key Concepts Recap

1. **URL Parsing** - Breaking down the URL into useful pieces
2. **Query Parameters** - Extra information after `?` in the URL
3. **Routing** - Deciding what to do based on the path
4. **Async/Await** - Waiting for file operations to finish
5. **Error Handling** - Catching and handling problems gracefully
6. **Status Codes** - 200 (OK), 404 (Not Found), etc.
7. **Content-Type** - Telling the browser what type of data we're sending

---

## Tips for Debugging

1. **Check the console** - The `console.log()` on line 45 shows every request
2. **Check query parameters** - Add `console.log(queryParams)` to see what you're getting
3. **Check the file path** - Make sure `data.json` exists in the same folder
4. **Check status codes** - Use browser DevTools Network tab to see responses

---

## Next Steps

- Try adding more routes (like `/products` or `/about`)
- Try adding more query parameters (like `?sort=price&order=asc`)
- Try handling POST requests (for creating/updating data)
- Try adding authentication (checking if user is logged in)

Happy coding! 🎉

