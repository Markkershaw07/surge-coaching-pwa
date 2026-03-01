// Run this once with: node generate-icons.mjs
// Generates SVG-based PNG icons for the PWA

import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Letter S
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

writeFileSync('./public/icons/icon-192.png', generateIcon(192));
writeFileSync('./public/icons/icon-512.png', generateIcon(512));
console.log('Icons generated!');
