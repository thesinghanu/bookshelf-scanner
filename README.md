# My Shelf — a book barcode scanner (PWA)

Point your phone's camera at the barcode on the back of a book, and it looks the book
up and adds it to your shelf. It's a plain static web app — **no build step, no account,
no server** — and it installs to your phone's home screen like a real app.

- 📷 Scan EAN-13 book barcodes with the camera
- 🔎 Looks books up on [Open Library](https://openlibrary.org) (free, no API key)
- 📚 Saves your shelf on the device, with *Want to read / Reading / Read* statuses
- ⌨️ Type an ISBN by hand if a barcode won't scan
- 📥 Export / import your shelf as a JSON file
- 📴 Opens offline once installed — your shelf and the covers you've already seen keep
 working with no connection (new scans and look-ups still need the internet)

---

## Put it online (GitHub Pages)

You don't need to change anything in the code — every path is relative, so it works
at any repository address.

1. **Create a new repository** on GitHub (public), e.g. `my-shelf`.
2. **Add all these files**, keeping the folder structure exactly as-is — especially
 `.github/workflows/deploy.yml` and the `icons/` folder.
 - Easiest in the browser: on the repo page use **Add file → Upload files**, drag in
 everything, and commit. (Drag the whole folder so the sub-folders are preserved.)
 - Or with git:
 ```bash
 git init
 git add .
 git commit -m "My Shelf book scanner"
 git branch -M main
 git remote add origin https://github.com/YOUR-USERNAME/my-shelf.git
 git push -u origin main
 ```
3. **Turn on Pages:** repo **Settings → Pages → Build and deployment → Source:
 GitHub Actions**.
4. Open the **Actions** tab and wait for the "Deploy to GitHub Pages" run to finish
 (about a minute). It prints your link:
 `https://YOUR-USERNAME.github.io/my-shelf/`

Every time you push to `main`, it redeploys automatically.

> **Camera needs HTTPS.** GitHub Pages serves over HTTPS, so the camera works there.
> It will *not* work if you just open `index.html` from your computer (a `file://` or
> plain `http://` page can't use the camera). Use the Pages link, or run a local HTTPS
> server, for testing.

---

## Use it on your iPhone

1. Open the Pages link in **Safari**.
2. Tap the **Share** button → **Add to Home Screen**. Launch it from the new icon —
 it opens full-screen.
3. Tap **Scan a book**, allow camera access, and fill the frame with the barcode on the
 back cover. Good light and a steady hand help.

**Tips / troubleshooting**
- iOS asks for camera permission the first time — tap **Allow**.
- If the camera won't start inside the installed app on your version of iOS, open the
 link in **Safari** instead, or just use the **type an ISBN** box — both always work.
- Barcodes that aren't books (random products) usually won't be found — that's expected.
- Your shelf lives in this device's browser storage. Use **Export** now and then to keep
 a backup (and **Import** to restore it or move it to another device).

---

## Use it on Android

It works the same on Android — and scanning is actually a bit faster, because Chrome
has a built-in barcode detector the app uses automatically.

1. Open the Pages link in **Chrome**.
2. Tap the **Install app** button in the page (or Chrome's menu → **Install app /
 Add to Home screen**).
3. Launch it from the home screen, tap **Scan a book**, and allow camera access.

---

## Make it yours

Everything is in a few small files:

- `index.html` — the whole app (layout, styles, and logic are all in here)
- `manifest.webmanifest` — the app name, colours, and icons
- `sw.js` — the service worker that enables offline + install
- `icons/` — the app icons

Quick changes:
- **Name:** edit `<title>` and the `<h1>` in `index.html`, plus `name` / `short_name`
 in `manifest.webmanifest`.
- **Colour:** change `--accent` (and the dark-mode `--accent`) near the top of the
 `<​style>` block, and `theme_color` in the manifest.
- **Icons:** replace the PNGs in `icons/` with your own (keep the same file names/sizes).

If you ever change the files the service worker caches, bump the `CACHE` name in `sw.js`
(e.g. `myshelf-v2`) so phones pick up the new version.

---

## How it works, briefly

- **Scanning:** [`html5-qrcode`](https://github.com/mebjas/html5-qrcode) runs the camera
 and decodes the barcode. iOS Safari has no built-in barcode API, so the library falls
 back to decoding frames in JavaScript — which is why it works on iPhone.
- **Look-up:** it calls Open Library's `api/books` endpoint for the scanned ISBN. If a
 browser ever blocks that request (CORS), it automatically retries the same endpoint via
 JSONP, which can't be blocked — so the look-up is robust.
- **Covers:** images come from `covers.openlibrary.org`. That server doesn't allow reading
 the image bytes (no CORS), so the service worker caches each cover the first time it's
 shown and serves it from there when you're offline. Books with no cover on file show
 their first initial instead.

Enjoy building your shelf. 📖

