const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('📁 Copying frontend build to backend/public...');

const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const backendPublic = path.join(__dirname, '..', 'backend', 'public');

// Remove existing public directory
if (fs.existsSync(backendPublic)) {
  fs.rmSync(backendPublic, { recursive: true, force: true });
}

// Copy frontend dist to backend public
if (fs.existsSync(frontendDist)) {
  copyRecursiveSync(frontendDist, backendPublic);
  console.log('✅ Frontend copied successfully!');
} else {
  console.error('❌ Frontend dist directory not found. Run "npm run build:frontend" first.');
  process.exit(1);
}
