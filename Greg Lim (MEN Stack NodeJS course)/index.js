import { createServer } from "node:http";

const hostname = "127.0.0.1";
const port = 3000;

const server = createServer((req, res) => {
  console.log(req.url);
  res.statusCode = 200;
  res.setHeader("content-type", "text/plain");

  res.end("Hello from index.js");
});

server.listen(port, hostname, () => {
  console.log(`Server is running at https://${hostname}:${port}/`);
});
