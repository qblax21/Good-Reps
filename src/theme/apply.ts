/** Pushes theme colours and text size onto the page. */
import { colors } from './config';
import type { Settings } from '../data/types';

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

export function applyTheme() {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(colors)) root.style.setProperty(`--color-${kebab(k)}`, v);
}

export function applyTextSize(size: Settings['textSize']) {
  document.documentElement.dataset.text = size;
}
