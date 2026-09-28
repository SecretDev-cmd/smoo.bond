# smoom.bond

Home page + live server status for Super Mario Odyssey: Online.

## Layout

| Path | Purpose |
|---|---|
| `index.html` | Home page (trailer + feature card) |
| `servers/index.html` | Server status page. This is where **Servers** in the nav goes |
| `status.json`, `geo_cache.json` | Written every 5 min by the GitHub Action; read by `/servers/` |
| `scripts/check_servers.py` | Probes the servers and writes the two JSON files |
| `.github/workflows/check-servers.yml` | Runs the script on a schedule and commits the results |
| `smoom-home.css` / `smoom-home.js` | Home page styles + nav behaviour |
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

## Not built yet

Play, Host and FAQ nav entries (`/play/...`, `/host/...`, `/faq`) still 404,
as in the original home port.
