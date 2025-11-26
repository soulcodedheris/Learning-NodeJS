// Modern ES6 Imports - these are the "tools" we're bringing in
import http from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

// ES Module __dirname setup - tells Node where THIS file lives
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create our server - this is like a restaurant that listens for orders
const server = http.createServer(async (req, res) => {
  // ============================================================
  // URL PARSING EXPLAINED (for junior devs!)
  // ============================================================
  //
  // Think of a URL like this:
  //   http://localhost:3000/api?category=electronics&limit=5
  //   |----protocol----| |--host--| |path| |-----query params-----|
  //
  // The URL class breaks this down into pieces we can use:
  //   - pathname: "/api" (the route/path)
  //   - searchParams: { category: "electronics", limit: "5" } (the variables after ?)
  //
  // Why we need the base URL:
  //   req.url only gives us "/api?category=electronics" (no domain)
  //   So we add "http://localhost:3000" to make it a complete URL
  //   The URL class needs this to parse correctly

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Extract the pathname - this tells us which route they want
  // Example: "/api" or "/" or "/products"
  const pathName = url.pathname;

  // Extract query parameters (the stuff after the ? in the URL)
  // Example: ?category=electronics&limit=5 becomes { category: "electronics", limit: "5" }
  //
  // url.searchParams is a special object (URLSearchParams)
  // Object.fromEntries() converts it to a regular JavaScript object
  // So we can use queryParams.category instead of queryParams.get("category")
  const queryParams = Object.fromEntries(url.searchParams);

  // Log what we received (helps with debugging!)
  console.log(`${req.method} ${pathName}`, queryParams);

  // Route handling - checking what page they want
  if (pathName === "/") {
    // Home page
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!DOCTYPE html>
<html>
  <head>
    <title>Home Page</title>
  </head>
  <body>
    <h1>Welcome to the Home Page</h1>
    <p>This is the home page content.</p>
  </body>
</html>`);
  } else if (pathName === "/api") {
    // API endpoint - returning JSON data
    try {
      // Modern async/await - wait for the file to be read
      const data = await fs.readFile(join(__dirname, "data.json"), "utf-8");
      let productData = JSON.parse(data);

      // ============================================================
      // USING QUERY PARAMETERS - REAL WORLD EXAMPLE
      // ============================================================
      //
      // Query parameters let users add filters/modifiers to their requests
      // Example URLs:
      //   /api?category=electronics  → Only show electronics
      //   /api?limit=5               → Show only first 5 items
      //   /api?category=electronics&limit=5  → Both filters together!
      //
      // How it works:
      //   - Check if a parameter exists: if (queryParams.category)
      //   - Access its value: queryParams.category (returns a string)
      //   - Use it to modify your data!

      // Filter by category if they provided one
      // If user visits: /api?category=electronics
      // Then only items with category="electronics" will be returned
      if (queryParams.category) {
        productData = productData.filter(
          (item) => item.category === queryParams.category
        );
      }

      // Limit the number of results if they provided a limit
      // If user visits: /api?limit=5
      // Then only the first 5 items will be returned
      // parseInt() converts the string "5" to the number 5
      if (queryParams.limit) {
        productData = productData.slice(0, parseInt(queryParams.limit));
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(productData));
    } catch (error) {
      // If something goes wrong, tell the user nicely
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Data file not found" }));
    }
  } else {
    // 404 - they asked for something that doesn't exist
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 - Page Not Found</h1>");
  }
});

// Start the server on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
