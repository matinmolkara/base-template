const { execSync } = require("child_process");

try {
  console.log("Checking for outdated dependencies...");
  execSync("npm outdated", { stdio: "inherit" });

  console.log("Checking for security vulnerabilities...");
  execSync("npm audit", { stdio: "inherit" });

  console.log("Checking for unused dependencies...");
  execSync("npx depcheck", { stdio: "inherit" });
} catch (error) {
  console.error("Dependency check completed with issues");
}
