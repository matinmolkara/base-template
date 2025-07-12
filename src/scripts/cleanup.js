const fs = require("fs");
const path = require("path");

// پاک کردن فایل‌های غیرضروری
const foldersToClean = [
  "node_modules/.cache",
  ".next",
  "coverage",
  "cypress/videos",
  "cypress/screenshots",
];

foldersToClean.forEach((folder) => {
  const fullPath = path.join(__dirname, "..", folder);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`Cleaned: ${folder}`);
  }
});
