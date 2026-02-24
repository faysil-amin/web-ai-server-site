const fs = require("fs");

const file = fs.readFileSync(
  "./assignment-10-72af4-firebase-adminsdk-fbsvc-5e7bc47e2c.json",
  "utf8",
);

const base64 = Buffer.from(file).toString("base64");

fs.writeFileSync("key.txt", base64);

console.log("Saved in key.txt");
