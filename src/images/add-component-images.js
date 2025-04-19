// This script helps you add component images to the project
// You can run this script with Node.js to copy your images to the correct location

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Component types
const componentTypes = [
  'server',
  'database',
  'cache',
  'api_gateway',
  'load_balancer',
  'users'
];

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname);
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Check if images directory exists in the project root
const rootImagesDir = path.join(__dirname, '..', '..', 'images');
if (fs.existsSync(rootImagesDir)) {
  console.log('Found images directory in project root. Copying images...');
  
  // Copy images from root images directory to src/images
  componentTypes.forEach(type => {
    const sourcePath = path.join(rootImagesDir, `${type}.png`);
    const targetPath = path.join(imagesDir, `${type}.png`);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied ${type}.png from project root to src/images`);
    } else {
      console.log(`Warning: ${type}.png not found in project root`);
    }
  });
} else {
  console.log('No images directory found in project root.');
  console.log('Please create an "images" directory in the project root and add your component images there.');
  console.log('Required images:');
  componentTypes.forEach(type => {
    console.log(`- ${type}.png`);
  });
}

console.log('Done!'); 