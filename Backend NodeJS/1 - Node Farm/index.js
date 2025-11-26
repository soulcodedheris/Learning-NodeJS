const fs = require("fs");

// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}.`;

// fs.writeFileSync("./txt/output.txt", textOut);

// console.log("File written!");


fs.readFile('large-file.txt', (err, data) => {
    console.log("File read!");
  });
  console.log("This runs immediately!");