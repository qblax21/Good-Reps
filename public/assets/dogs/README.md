# Dog mascot art

Right now the app uses built-in cartoon placeholders (`src/theme/mascots/art.tsx`).
To swap in illustrations of the real dogs:

## 1. What to make

For **each dog**, 4 square images (about 600 × 600 px) with a **transparent background**,
head-and-shoulders framing, facing the viewer:

| File            | Pose                                                         |
| --------------- | ------------------------------------------------------------ |
| `popup.png`     | Happy, alert, mouth slightly open — the everyday “hi!” pose  |
| `peek.png`      | Same framing, eyes looking up/sideways (only the top half shows) |
| `celebrate.png` | Big open-mouth smile, tongue out, maybe sparkles or a party hat |
| `sleep.png`     | Eyes closed, cozy, optional little “z z z”                   |

Keep the head in the **middle 80%** and the chin/shoulders touching the bottom edge —
the pop-ups rise up from the bottom of the screen. (A “sploot” falls back to `celebrate.png`.)

Put them in a folder per dog, e.g.:

```
public/assets/dogs/dog-a/popup.png  (the corgi)
public/assets/dogs/dog-b/popup.png  (the terrier-corgi mix)
```

## 2. Hook them up

In `src/theme/mascots/dogs.ts`, add `images` to each dog:

```ts
images: {
  popup: 'assets/dogs/dog-a/popup.png',
  peek: 'assets/dogs/dog-a/peek.png',
  celebrate: 'assets/dogs/dog-a/celebrate.png',
  sleep: 'assets/dogs/dog-a/sleep.png',
},
```

Any pose you leave out keeps using the cartoon placeholder. Rebuild and redeploy.

## 3. How to get the cartoons made

**Option A: an illustrator (most personal).** Search Etsy or Fiverr for “cartoon pet portrait
sticker” or “custom dog emoji/sticker set”. Send 3–5 clear photos per dog (face, side, full body,
good light) and ask for the 4 poses above as **transparent PNGs, 600 px square, matching style**.
Mentioning the corgi’s ears and the mix’s wiry eyebrows and beard helps a lot.
Usually US$20–60 per dog.

**Option B: an AI image tool (quickest).** Upload a clear photo of the dog to an image generator
that accepts reference photos, and use a prompt like:

> Cute flat cartoon sticker of this exact dog, head and shoulders, facing viewer, thick soft outlines,
> pastel colors, simple shapes, white background, friendly happy expression with mouth open.
> Keep the dog's real markings: [e.g. red-and-white corgi with big upright ears / grey-tan wiry terrier
> mix with bushy eyebrows and a beard].

Then repeat with “eyes closed sleeping”, “huge excited smile with tongue out and sparkles”, and
“looking up curiously”. Use the **same conversation/seed** so the style stays consistent.
Remove the background (iPhone Photos: long-press the subject → Copy, or any background-remover),
then crop to a square.

**Option C: trace the photos yourself.** Open a photo in a drawing app (Procreate, Inkscape,
Figma), trace simple shapes on a layer above, fill flat colors, export as PNG or SVG.
SVG works too — just use `.svg` paths in `images`.

Tip: run `npm run dev`, open Settings → “Meet the dogs” to check your art at different sizes.
