# Steps from Apple Health: setup

A web app can't read Apple Health, so three pieces work together:

1. **An iPhone Shortcut** on Mom's phone reads her daily step totals (last 7 days) from Health and sends them to…
2. **A tiny Cloudflare Worker** (`worker.js` in this folder), which stores them, and…
3. **Good Reps** fetches them whenever it opens and shows them on Today and Progress.

It's free (Cloudflare's free plan is far more than this needs) and takes about 20 minutes once.
Everything uses one private link, the **steps link**:

```
https://good-reps-steps.<your-subdomain>.workers.dev/?key=<your-key>
```

Anyone with the link can see her step counts, so only share it with her phone.

---

## Part 1: Make a key (1 minute, on your PC)

Run this in PowerShell and copy the result. That's your **key**: a random 32-character code.

```powershell
[guid]::NewGuid().ToString('N')
```

## Part 2: The server (10 minutes, on your PC)

1. Go to <https://dash.cloudflare.com/sign-up> and make a free account. Verify your email.
2. **Make the storage.** In the left menu open **Storage & databases → Workers KV**, then **Create**
   (or *Create namespace*). Name it `good-reps-steps` and create it.
3. **Make the worker.** In the left menu open **Compute (Workers) → Workers & Pages**, then
   **Create → Start with Hello World!** Name it `good-reps-steps` and click **Deploy**.
4. **Put in the code.** On the worker's page click **Edit code**. Select everything in `worker.js`
   on the left, delete it, and paste the full contents of
   [`steps-server/worker.js`](./worker.js) from this repo (open it on GitHub, click **Raw**, select all,
   copy). Click **Deploy**.
5. **Connect the storage.** Back on the worker's page open the **Bindings** tab → **Add binding** →
   **KV namespace**. Variable name: `STEPS` (capitals). Namespace: `good-reps-steps`. Click
   **Add binding** / **Deploy**.
6. **Add the key.** Open **Settings → Variables and Secrets → Add**. Type: **Secret**.
   Variable name: `STEPS_KEY`. Value: your key from Part 1. Click **Deploy**.
7. **Build your steps link.** On the worker's overview page, under **Domains & Routes**, copy the
   address ending in `.workers.dev`. Add `/?key=` and your key:
   `https://good-reps-steps.yourname.workers.dev/?key=3f9c…`
8. **Test it.** Open the steps link in your browser. You should see
   `{"days":{},"updatedAt":null}`. If you see `wrong or missing key`, check the key. If it says the
   key or KV isn't set, redo step 5 or 6.

Get the steps link to her phone (text it to yourself and set it up on her phone, or text it to her).

## Part 3: The Shortcut (5 minutes, on HER iPhone)

Open the **Shortcuts** app → **Shortcuts** tab → **+** (top right). Name it **Good Reps Steps**
(tap the name at the top). Add these actions in order, using the search bar at the bottom:

1. **Find Health Samples**
   - Tap **Type** → **Steps**.
   - Tap **Add Filter** → change it to **Start Date** · **is in the last** · **7** · **days**.
   - Tap the **▸ / Show More** arrow and set **Group By** → **Day**. (Leave *Fill Missing* off.)
2. **Repeat with Each** — it should already say *Repeat with each item in Health Samples*.
3. Inside the repeat, add **Text**. In the text box:
   - Tap **Repeat Item** in the bar above the keyboard (or *Select Variable* → *Repeat Item*).
     Tap the blue **Repeat Item** bubble → change it to **Start Date** → **Date Format: Custom** →
     type `yyyy-MM-dd`.
   - After it, type a space, `=`, a space.
   - Insert **Repeat Item** again, tap it → change it to **Value**.
   - The box should read: `[Start Date] = [Value]`
4. After **End Repeat**, add **Combine Text**. It should say *Combine Repeat Results with New Lines*.
5. Add **Get Contents of URL**.
   - URL: paste the **steps link**.
   - Tap **Show More**. Method: **POST**. Request Body: **JSON**.
   - **Add new field** → **Text**. Key: `lines`. Value: tap and pick the **Combined Text** variable.
6. Tap **▶ (Play)** at the bottom to run it once.
   - Allow Shortcuts to read **Steps** from Health when asked (*Turn On All* or just Steps → Allow).
   - Allow it to connect to `workers.dev` (*Always Allow*).
   - The result should say something like `{"ok":true,"saved":7}`.

## Part 4: Make it run by itself (3 minutes, on HER iPhone)

iPhones lock Health data while the phone is locked, so the Shortcut works best right when she's
using her phone. Set it to run when she opens an app she uses every day:

1. Shortcuts → **Automation** tab → **+** (or *New Automation*).
2. Choose **App** → **Choose** → pick one or two apps she opens daily (e.g. **Messages**, **Photos**,
   **Facebook**). Keep **Is Opened** checked.
3. Choose **Run Immediately** and turn **off** *Notify When Run*. Tap **Next**.
4. Pick **Good Reps Steps**. Done.

Optional backup: another automation with **Time of Day** → **12:00 PM**, **Daily**, **Run Immediately**.

## Part 5: Connect the app (1 minute, on HER iPhone)

Open **Good Reps** (from the Home Screen icon) → **Settings** → **Steps from Apple Health**. Paste
the steps link → **Connect steps**. The Today screen now shows her steps, and Settings has a
daily step goal (default 7,000). Days that reach it get a daisy.

---

## If something's off

| What you see | Fix |
| --- | --- |
| App says *key doesn't match* | The link in the app and the `STEPS_KEY` secret differ. Copy the whole link again. |
| App says *couldn't reach* | Check the link opens in Safari. Make sure it starts with `https://`. |
| Shortcut result `no step lines found` | The Text action isn't filled in right. It must read `[Start Date] = [Value]`, with the date as `yyyy-MM-dd`. |
| Steps look doubled | Only if she later gets an Apple Watch: Health may count both devices. Tell Claude and it'll switch the Shortcut to a de-duplicated total. |
| Numbers stop updating | Open Shortcuts → Automation and check the automation is still on. iOS updates sometimes turn on *Ask Before Running*. |

The server keeps a bit over two years of daily totals. To wipe them, delete the `steps` key in the
`good-reps-steps` KV namespace in the Cloudflare dashboard.
