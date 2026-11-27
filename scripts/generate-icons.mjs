/**
 * Generates app icons, the apple-touch-icon and iPhone splash screens from SVG.
 * Run: npm run icons   (re-run after changing colours or the app name)
 * Output goes to public/icons and public/splash; the <link> tags live in index.html.
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const GREEN = '#2B6E46';
const CREAM = '#FFF9EC';
const NAME = 'Good Reps';

const daisy = (cx, cy, r) => {
  let petals = '';
  for (let i = 0; i < 14; i++) {
    petals += `<ellipse cx="${cx}" cy="${cy - r * 0.55}" rx="${r * 0.17}" ry="${r * 0.42}" fill="#FFFFFF" transform="rotate(${(360 / 14) * i} ${cx} ${cy})"/>`;
  }
  return `${petals}<circle cx="${cx}" cy="${cy}" r="${r * 0.3}" fill="#F6C945"/><circle cx="${cx - r * 0.08}" cy="${cy - r * 0.08}" r="${r * 0.1}" fill="#FBE38A"/>`;
};

/** Icon: green background, big daisy. `pad` shrinks the daisy for maskable safe zones. */
const iconSvg = (size, pad = 0, rounded = false) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${rounded ? 110 : 0}" fill="${GREEN}"/>
  <circle cx="420" cy="96" r="40" fill="#F6D56B" opacity="0.35"/>
  ${daisy(256, 256, 200 * (1 - pad))}
</svg>`;

const splashSvg = (w, h) => {
  const s = Math.min(w, h);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${CREAM}"/>
  <rect x="${w / 2 - s * 0.16}" y="${h / 2 - s * 0.26}" width="${s * 0.32}" height="${s * 0.32}" rx="${s * 0.07}" fill="${GREEN}"/>
  ${daisy(w / 2, h / 2 - s * 0.1, s * 0.13)}
  <text x="${w / 2}" y="${h / 2 + s * 0.16}" font-family="Arial Rounded MT Bold, Nunito, Arial, sans-serif" font-weight="800"
        font-size="${s * 0.085}" fill="${GREEN}" text-anchor="middle">${NAME}</text>
</svg>`;
};

mkdirSync('public/icons', { recursive: true });
mkdirSync('public/splash', { recursive: true });

const png = (svg, out) => sharp(Buffer.from(svg)).png().toFile(out);

await png(iconSvg(192), 'public/icons/icon-192.png');
await png(iconSvg(512), 'public/icons/icon-512.png');
await png(iconSvg(512, 0.22), 'public/icons/icon-maskable-512.png');
await png(iconSvg(180), 'public/icons/apple-touch-icon.png'); // iOS rounds corners itself; must be opaque
writeFileSync('public/icons/favicon.svg', iconSvg(64, 0, true));

// iPhone portrait splash screens: [css width, css height, pixel ratio]
export const DEVICES = [
  [440, 956, 3], // 16/17 Pro Max
  [402, 874, 3], // 16/17 Pro, 17
  [430, 932, 3], // 14/15 Pro Max, 15/16 Plus
  [393, 852, 3], // 14 Pro, 15, 15 Pro, 16
  [428, 926, 3], // 12/13 Pro Max, 14 Plus
  [390, 844, 3], // 12, 13, 14
  [375, 812, 3], // X, XS, 11 Pro, 12/13 mini
  [414, 896, 3], // XS Max, 11 Pro Max
  [414, 896, 2], // XR, 11
  [414, 736, 3], // 6/7/8 Plus
  [375, 667, 2], // SE 2/3, 6/7/8
];
const links = [];
for (const [w, h, r] of DEVICES) {
  const file = `splash/iphone-${w * r}x${h * r}.png`;
  await png(splashSvg(w * r, h * r), `public/${file}`);
  links.push(
    `<link rel="apple-touch-startup-image" href="${file}" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)" />`,
  );
}
writeFileSync('scripts/splash-links.html', links.join('\n') + '\n');
console.log('Icons and splash screens generated. Splash <link> tags written to scripts/splash-links.html');
