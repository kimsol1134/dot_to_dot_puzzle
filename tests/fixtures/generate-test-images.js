/**
 * Generate test fixture images for E2E tests
 * Run with: node tests/fixtures/generate-test-images.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Simple circle image (100x100px)
function generateCircle() {
  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 100, 100);

  // Black circle
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(50, 50, 40, 0, 2 * Math.PI);
  ctx.fill();

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'simple-circle.png'), buffer);
  console.log('✓ Generated simple-circle.png (100x100px)');
}

// Medium complexity image (500x500px)
function generateMedium() {
  const canvas = createCanvas(500, 500);
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 500, 500);

  // Black rectangle outline
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  ctx.strokeRect(50, 50, 400, 400);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'test-500x500.png'), buffer);
  console.log('✓ Generated test-500x500.png (500x500px)');
}

// Text file for error testing
function generateTextFile() {
  fs.writeFileSync(path.join(__dirname, 'test.txt'), 'This is not an image file');
  console.log('✓ Generated test.txt');
}

// Run all generators
try {
  generateCircle();
  generateMedium();
  generateTextFile();
  console.log('\n✅ All test fixtures generated successfully!');
} catch (error) {
  console.error('❌ Error generating fixtures:', error.message);
  process.exit(1);
}
