# BarTrack POS Icons

## Icon Requirements

Place the following icon sizes in this directory for full PWA support:

### Required Sizes
- `icon-16x16.png` - Browser favicon
- `icon-32x32.png` - Browser favicon
- `icon-72x72.png` - iOS app icon
- `icon-96x96.png` - Android app icon
- `icon-128x128.png` - Chrome Web Store
- `icon-144x144.png` - Windows tile
- `icon-152x152.png` - iOS app icon
- `icon-180x180.png` - iOS app icon (retina)
- `icon-192x192.png` - Android app icon
- `icon-384x384.png` - Android splash screen
- `icon-512x512.png` - High-res app icon

### Design Guidelines

**Brand Colors:**
- Primary: #667eea (Purple)
- Secondary: #48bb78 (Green)
- Accent: #f6ad55 (Orange)
- Background: #1a202c (Dark)

**Icon Design:**
- Simple, recognizable symbol
- Clear at small sizes
- Good contrast
- No text (text doesn't scale well)
- Square with rounded corners
- Transparent or solid background

**Recommended Tools:**
- Figma (https://figma.com)
- Adobe Illustrator
- Sketch
- Inkscape (free)
- GIMP (free)

### Quick Icon Generation

You can generate all required sizes from a single 512x512 PNG using:

**Online Tools:**
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/
- https://favicon.io/

**Command Line (ImageMagick):**
```bash
# Install ImageMagick
sudo apt-get install imagemagick

# Generate all sizes from icon-512x512.png
convert icon-512x512.png -resize 16x16 icon-16x16.png
convert icon-512x512.png -resize 32x32 icon-32x32.png
convert icon-512x512.png -resize 72x72 icon-72x72.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 128x128 icon-128x128.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 152x152 icon-152x152.png
convert icon-512x512.png -resize 180x180 icon-180x180.png
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 384x384 icon-384x384.png
```

### Temporary Placeholder

Until custom icons are created, you can use a simple colored square or the browser's default icon. The app will still function perfectly.

### Icon Checklist
- [ ] Create 512x512 master icon
- [ ] Generate all required sizes
- [ ] Test icons on iOS device
- [ ] Test icons on Android device
- [ ] Test icons on desktop (Chrome, Edge, Firefox)
- [ ] Verify icons in manifest.json
- [ ] Check icons display correctly when installed

### Example Icon Concept

**BarTrack POS Icon Ideas:**
1. **Cocktail Glass** - Classic bar symbol
2. **Cash Register** - POS system symbol
3. **Bar Chart** - Analytics/tracking theme
4. **"B" Letter** - Initial of BarTrack
5. **Bottle + Graph** - Combination of bar + analytics

Choose something memorable and professional!
