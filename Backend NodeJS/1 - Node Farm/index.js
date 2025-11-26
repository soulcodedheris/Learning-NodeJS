import { readFileSync, writeFileSync } from "node:fs";

const input = readFileSync("./txt/read-this.txt", "utf-8");

console.log(input);

const output = `This is the text gotten from the "read-this.txt" file in the next sentence. ${input}`;

writeFileSync("./txt/output.txt", output, "utf-8");
