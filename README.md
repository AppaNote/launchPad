# LaunchPad

A single-page browser launcher + database registry + resource library. Plain HTML/CSS/JS, no build step, no server required.

## Run it
Double-click `index.html` (or drag it into Chrome/Edge). Bookmark it, or set it as your browser start page. Nothing to install — it is just a page.

### Single-file copy
`launchpad-standalone.html` is the whole app (CSS + JS inlined) in one file, for machines where you can only paste a single file. Regenerate it after editing the sources with `python3 build-standalone.py`.

## Data & persistence
Everything is stored in your browser's `localStorage` under the key `launchpad.v1`. Items are only removed when you delete them (each delete asks for confirmation). Data is per browser + per profile, so use **··· → Export backup** to move it to another machine and **Import backup** to restore.

## Features
- **Launcher** — environment panels (PROD, PRODSUP, UAT, SIT). Each panel is a grid of tiles that open a URL in a new tab.
  - Left/right arrows (or the ← → keys) rotate pages endlessly in both directions: from the last page, "next" wraps to page 1.
  - Two environments per page; add more environments and pages appear automatically.
  - Every tile and environment has edit/delete; tiles can be moved between environments by changing the Environment field.
- **Databases** — server, database name, port, user, notes, filtered by environment, with one-click copy of server/database.
- **Resources** — visual link cards instead of raw URLs: YouTube/Vimeo links show the video thumbnail and a play badge, other links show a favicon + domain badge over a gradient monogram tile. Category + tag filters; clicking a card opens the link.
  - Leave **Title** blank and it is derived from the link (URL slug, or the `q=` search term). YouTube/Vimeo titles and thumbnails are pulled from their CORS-enabled oEmbed endpoints on first render and then cached in your saved data; if the network blocks it, the derived title stays.
  - Any other site cannot be read cross-origin from a file:// page, so paste a **Thumbnail URL** manually if you want a custom image.
- **Quick links bar** — the top row is a set of groups (SharePoint, Azure DevOps, Intranet, …). Hovering a group drops down its links, so one SharePoint entry can hold every site you use; click a group with no children to open its own URL. Groups and their links each have edit/delete, and `+ Add link` inside a menu adds to that group.
- **Themes** — the **Theme** swatches at the bottom of the sidebar switch between six palettes (Sunny — the default warm yellow — Aurora, Gold, Emerald, Rose, Slate). The choice is saved with your data and carried along by export/import.
- **Launcher tiles** are round, colourful app icons (iPad style) sized so a full environment page fits on screen without scrolling.
- **Navigation** is a floating pill of round icon buttons on the left (Launcher, Databases, Resources); the gear button at its bottom opens Theme and Background settings.
- **Background photo** — under **Background** in the sidebar, **Upload** a picture from your PC or paste an image **URL**; panels turn to frosted glass over it, the **Blur** slider softens the photo, and **×** goes back to the plain theme background. Uploads are downscaled (max 1920 px JPEG) and stored in localStorage under `launchpad.bg`, separately from your data; export/import includes it.
- Global **+ Add** button, search across the active tab, JSON export/import, reset to defaults.

## Files
- `index.html` — markup
- `styles.css` — liquid-glass theme
- `app.js` — state, persistence, rendering
- `launchpad-standalone.html` — generated single-file build
- `build-standalone.py` — generator for the single-file build
