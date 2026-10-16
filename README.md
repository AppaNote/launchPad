# LaunchPad

A single-page browser launcher + database registry + resource library. Plain HTML/CSS/JS, no build step, no server required.

## Run it
Double-click `index.html` (or drag it into Chrome/Edge). Bookmark it, or set it as your browser start page. Nothing to install — it is just a page.

### Single-file copy
`launchpad-standalone.html` is the whole app (CSS + JS inlined) in one file, for machines where you can only paste a single file. Regenerate it after editing the sources with `python3 build-standalone.py`.

## Data & persistence
Everything is stored in your browser's `localStorage` under the key `launchpad.v1` (Markdown notes under `launchpad.notes`, background photo under `launchpad.bg`). Items are only removed when you delete them (each delete asks for confirmation). Data is per browser + per profile, so use **Backup → Export** (gear button in the pill, or **···**) to save one `.json` file with every launcher link, quick link, database, resource, note, theme and background, and **Backup → Import** to restore it.

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
- **Notes** — a Markdown library shown as portrait page thumbnails (e-reader style); empty until you create a file. **+** opens a Typora-style editor with the source on the left and a live preview on the right; drag the divider to resize (double-click resets). **Edit / Split / Read** switch between source only, side by side, and a clean reading view; existing files open in Read. **Save** (Ctrl+S) updates the file, **Save As** (Ctrl+Shift+S) asks for a file name with extension (`.md` is added if you leave it off). **Export** downloads the note as `.md` or prints it to **PDF** (choose *Save as PDF* in the print dialog). **Open .md file…** or drag-and-drop imports existing Markdown files. Supports headings H1–H7 (`#######` is an app-only seventh level), bold/italic/strike/highlight, links, images, lists, task lists, nested `>` quotes, tables, `inline code` with any number of backticks, and fenced code blocks (```` ``` ````, ```` ```` ````, `~~~`, …) with syntax colouring for `sql`, `python`, `js`, `powershell`, `bash` and a Copy button; raw HTML is shown as text.
  - **Table of contents** — type `[TOC]` on its own line (or the **TOC** toolbar button) for a clickable contents list; the **Outline** button toggles a side panel listing every heading (click to jump).
  - **Subject** — a title block at the top of the note, written as front matter (`---` / `subject: …` / `---`, optional `author:` / `date:`); the **Heading** dropdown's *Subject* entry creates it from the current line. Ctrl+1…7 set heading levels, Ctrl+0 back to paragraph, Ctrl+Shift+K inserts a code block.
- **Themes** — the **Theme** swatches at the bottom of the sidebar switch between six palettes (Sunny — the default warm yellow — Aurora, Gold, Emerald, Rose, Slate). The choice is saved with your data and carried along by export/import.
- **Launcher tiles** are round, colourful app icons (iPad style) sized so a full environment page fits on screen without scrolling.
- **Navigation** is a floating pill of round icon buttons on the left (Launcher, Databases, Resources, Notes); the gear button at its bottom opens Theme, Background and Backup.
- **Background photo** — under **Background** in the sidebar, **Upload** a picture from your PC or paste an image **URL**; panels turn to frosted glass over it, the **Blur** slider softens the photo, and **×** goes back to the plain theme background. Uploads are downscaled (max 1920 px JPEG) and stored in localStorage under `launchpad.bg`, separately from your data; export/import includes it.
- Global **+ Add** button, search across the active tab, JSON export/import, reset to defaults.

## Files
- `index.html` — markup
- `styles.css` — liquid-glass theme
- `app.js` — state, persistence, rendering
- `launchpad-standalone.html` — generated single-file build
- `build-standalone.py` — generator for the single-file build
