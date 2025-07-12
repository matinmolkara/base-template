#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// دریافت نام پروژه از command line
const projectName = process.argv[2];

if (!projectName) {
  console.error('❌ Please provide a project name');
  console.log('Usage: node scripts/create-project.js <project-name>');
  process.exit(1);
}

console.log(`🚀 Creating new project: ${projectName}`);

// مسیر template و مقصد
const templatePath = path.join(__dirname, '..', 'templates', 'base-template');
const targetPath = path.join(process.cwd(), projectName);

// بررسی وجود template
if (!fs.existsSync(templatePath)) {
  console.error('❌ Template not found');
  process.exit(1);
}

// بررسی عدم وجود فولدر هدف
if (fs.existsSync(targetPath)) {
  console.error('❌ Project directory already exists');
  process.exit(1);
}

// کپی کردن template
console.log('📂 Copying template files...');
copyDirectory(templatePath, targetPath);

// تغییر نام در package.json
console.log('📝 Updating package.json...');
updatePackageJson(targetPath, projectName);

// نصب dependencies
console.log('📦 Installing dependencies...');
process.chdir(targetPath);
execSync('npm install', { stdio: 'inherit' });

// راه‌اندازی Git
console.log('🔧 Initializing Git repository...');
execSync('git init', { stdio: 'inherit' });
execSync('git add .', { stdio: 'inherit' });
execSync('git commit -m "Initial commit"', { stdio: 'inherit' });

console.log('✅ Project created successfully!');
console.log(`\nNext steps:`);
console.log(`  cd ${projectName}`);
console.log(`  npm run dev`);

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  
  files.forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    
    if (fs.statSync(srcFile).isDirectory()) {
      copyDirectory(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

function updatePackageJson(projectPath, projectName) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.name = projectName;
  packageJson.version = '0.1.0';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}