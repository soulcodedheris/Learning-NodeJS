import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const hostname = "127.0.0.1";
const port = 8000;

const homePage = readFileSync("./home.html", "utf-8");
const contactPage = readFileSync("./contact.html", "utf-8");
const aboutPage = readFileSync("./about.html");
const notfoundPage = readFileSync("./notfound.html", "utf-8");

const server = createServer((req, res) => {
  if (req.url === "/about") {
    res.end(aboutPage);
  } else if (req.url === "/contact") {
    res.end(contactPage);
  } else if (req.url === "/") {
    res.end(homePage);
  } else {
    res.writeHead(404);
    res.end(notfoundPage);
  }
});

server.listen(port, hostname, () => {
  console.log(`Server is running at https://${hostname}:${port}/`);
});
