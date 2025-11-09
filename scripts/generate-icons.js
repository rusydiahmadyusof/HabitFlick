const sharp = require('sharp');
const path = require('path');

// Create SVG icon with HabitFlick branding
function createIconSVG(size, color = '#2563eb') {
  const fontSize = Math.round(size * 0.25);
  const iconSize = Math.round(size * 0.4);
  const center = size / 2;
  
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <circle cx="${center}" cy="${center - size * 0.1}" r="${iconSize * 0.3}" fill="white" opacity="0.9"/>
  <circle cx="${center - size * 0.15}" cy="${center + size * 0.1}" r="${iconSize * 0.25}" fill="white" opacity="0.9"/>
  <circle cx="${center + size * 0.15}" cy="${center + size * 0.1}" r="${iconSize * 0.25}" fill="white" opacity="0.9"/>
  <text x="${center}" y="${center + size * 0.35}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">HF</text>
</svg>`;
}

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  const themeColor = '#2563eb'; // Blue color from manifest
  
  try {
    // Generate 192x192 icon
    const svg192 = createIconSVG(192, themeColor);
    await sharp(Buffer.from(svg192))
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    
    console.log('✓ Generated icon-192.png');
    
    // Generate 512x512 icon
    const svg512 = createIconSVG(512, themeColor);
    await sharp(Buffer.from(svg512))
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    
    console.log('✓ Generated icon-512.png');
    console.log('\n✅ PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

