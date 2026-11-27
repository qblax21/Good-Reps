/**
 * Renders the dog cartoons to static SVG so they can be reviewed outside the app.
 * Run: npx tsx scripts/art-sheet.tsx <out.json>
 * Writes { poses: { daisy: {pose: svg}, eddie: {...} }, eddieVariants: [{ label, svg }] }.
 */
/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { writeFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { CorgiArt, TerrierCorgiArt } from '../src/theme/mascots/art';
import type { Pose } from '../src/theme/mascots/dogs';

const poses: Pose[] = ['popup', 'peek', 'celebrate', 'sleep', 'sploot'];
const svg = (el: React.ReactElement) => renderToStaticMarkup(el).replace(/ width="\d+" height="\d+"/, '');

const out = {
  poses: {
    daisy: Object.fromEntries(poses.map((p) => [p, svg(<CorgiArt pose={p} />)])),
    eddie: Object.fromEntries(poses.map((p) => [p, svg(<TerrierCorgiArt pose={p} />)])),
  },
  eddieVariants: [
    { label: 'A bit scruffy', earSpread: 0.5, scruff: 0.4 },
    { label: 'Scruffy', earSpread: 0.8, scruff: 0.7 },
    { label: 'Extra scruffy', earSpread: 1, scruff: 1 },
  ].map((v) => ({ ...v, svg: svg(<TerrierCorgiArt pose="popup" earSpread={v.earSpread} scruff={v.scruff} />) })),
};
writeFileSync(process.argv[2] ?? 'art-sheet.json', JSON.stringify(out));
console.log('wrote', process.argv[2] ?? 'art-sheet.json');
