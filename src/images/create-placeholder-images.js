// This script creates placeholder images for each component type
// You can run this script with Node.js to generate placeholder images
// or replace these with your own images

const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');

// Component types
const componentTypes = [
  'server',
  'database',
  'cache',
  'api_gateway',
  'load_balancer',
  'users'
];

// Component colors
const componentColors = {
  'server': '#ff9999',
  'database': '#99ff99',
  'cache': '#9999ff',
  'api_gateway': '#ffff99',
  'load_balancer': '#ff99ff',
  'users': '#ffa500'
};

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname);
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create a placeholder image for each component type
componentTypes.forEach(type => {
  const canvas = createCanvas(96, 48);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = componentColors[type];
  ctx.fillRect(0, 0, 96, 48);
  
  // Draw border
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 96, 48);
  
  // Draw component name
  ctx.fillStyle = '#000';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(type.toUpperCase(), 48, 24);
  
  // Save image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(imagesDir, `${type}.png`), buffer);
  
  console.log(`Created placeholder image for ${type}`);
});

console.log('All placeholder images created successfully!'); 