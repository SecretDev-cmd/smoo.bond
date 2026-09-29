# smoom.bond

Home page + live server status for Super Mario Odyssey: Online.

## Layout

| Path | Purpose |
|---|---|
| `index.html` | Home page (trailer + feature card) |
| `play/index.html` | Play guides: Hide & Seek rules, Switch, Ryujinx, building the mod |
| `host/index.html` | Hosting guides: binary, docker, `settings.json`, commands, Discord bot, router, VPN |
| `faq/index.html` | FAQ |
| `404.html` | Not-found page; also turns `/play/switch`, `/faq/103`, ... into `/play/#switch`, `/faq/#103` |
| `data/` | `moons.json` / `stages.json` (from smoo.it, see `data/LICENSE.md`) used by the command modals |
| `servers/index.html` | Server status page. This is where **Servers** in the nav goes |
| `status.json`, `geo_cache.json` | Written every 5 min by the GitHub Action; read by `/servers/` |
| `scripts/check_servers.py` | Probes the servers and writes the two JSON files |
| `.github/workflows/check-servers.yml` | Runs the script on a schedule and commits the results |
| `smoom-home.css` / `smoom-home.js` | Home page styles + nav behaviour |
| `smoom-pages.css` / `smoom-pages.js` | Styles + behaviour for Play/Host/FAQ (accordion cards, tooltips, data modals) |
| `smoom-nav.js` | Play/Host dropdown menus (loaded by every page with the full nav) |
| `img/`, `assets/`, `favicon*`, `apple-touch-icon.png` | Shared images and icons |
| `CNAME` | Custom domain (`smoom.bond`) |

## Routing

Nav links are root-relative. `Servers` points to `/servers/`, which GitHub Pages
serves from `servers/index.html`. The server page fetches `/status.json` from
the site root, so `status.json`/`geo_cache.json` must stay at the repo root
(that is where `check_servers.py` writes them).

The server page carries its own copy of the nav styles instead of loading
`smoom-home.css`, because the home stylesheet sets global rules (`a`, `.app`,
`body`) that would change the table styling.

## Adding or editing servers

The server list lives in two places that must stay in sync:
the `SERVERS` list in `scripts/check_servers.py`, and the table rows
(`data-idx`) plus the `SERVERS` array in `servers/index.html`.

## Play / Host / FAQ pages

These are static ports of the smoo.it Vue views. Each page is one accordion of
cards; a card is opened by the URL hash, e.g. `/host/#docker` or `/faq/#103`
(the old smoo.it style `#/faq/103` also works). GitHub Pages can't route
`/faq/103`, so `404.html` redirects such paths to the hash form.

The `Requirements` / `Links` boxes at the top of Play and Host, and the
content of every card, live directly in the page's `index.html`. Edit them
there. Content that mentions a server or mod version (`1.0.5`, `v1.0.0`, ...)
is copied verbatim from smoo.it and may need updating over time.

The "Remote server" card is still the upstream `TODO` stub and is disabled in
the Host menu, as on smoo.it.

Content and code ported from smoo.it are MPL-2.0.
