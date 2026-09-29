#!/usr/bin/env python3
"""
Checks TCP connectivity to a list of game servers and writes the result
to status.json for the static page to consume (avoids browser CORS
issues entirely, since this runs server-side in a GitHub Action).

Also resolves each server's geolocation server-side (once, cached to
disk in geo_cache.json), so the frontend no longer has to call
ipapi.co directly from every visitor's browser -- that was hitting
ipapi.co's free-tier rate limit almost immediately.

Player counts and per-player info (optional, per server)
---------------------------------------------------------
The SMO Online server does not expose player count over the plain game
handshake -- it only comes from the server's separate "JsonApi" feature
(github.com/Sanae6/SmoOnlineServer, "json-api" branch), which each
server admin has to explicitly enable in settings.json and hand out a
token for. Confirmed directly from that branch's source
(Server/JsonApi/*.cs), plus by capturing a real reply:

- It is NOT a separate HTTP endpoint -- there is no extra port. The
  request is a single raw write on a brand-new TCP connection to the
  *same* host/port as the normal game server, sent as the very first
  bytes on that connection (checked only on a connection's first
  packet -- see Server.cs's "first &&" check).
- The request must be UTF-8, at most 512 bytes total, shaped exactly
  like:
      {"API_JSON_REQUEST":{"Token":"<token>","Type":"Status"}}
  This works because the server reads the first 20 bytes of every new
  connection as a binary packet header (16-byte Guid + 2-byte type +
  2-byte size) before deciding what kind of packet it is -- and the
  literal ASCII text `{"API_JSON_REQUEST":` is exactly 20 bytes and
  happens to decode, byte-for-byte, to the special marker type the
  server watches for. Any other framing/padding will NOT be recognized
  as a JSON API request.
- A "Status" request needs no "Data" field. The server returns exactly
  the sub-objects the token has permission for: with only the
  "Status/Players" permission granted (no "Status/Players/<X>" or
  "Status/Settings/*"), the reply is just
      {"Players":[{},{},...]}
  i.e. one empty object per connected player -- so len(Players) is the
  live player count, permission-independent of which player fields are
  visible.
- Per-player fields are each gated by their own permission string
  (Server/JsonApi/ApiRequestStatus.cs's Mutators dict), so a token
  only needs to grant the specific ones we use. We ask for/use:
      Status/Players/Name       -> "Name":     display name
      Status/Players/Kingdom    -> "Kingdom":  friendly kingdom name,
                                   resolved server-side from the raw
                                   internal Stage id via Shared/Stages.cs
                                   (falls back to null if unmapped, e.g.
                                   in a non-kingdom/menu/lobby stage)
      Status/Players/Stage      -> "Stage":    raw internal stage id
                                   (kept as a fallback/tooltip; not as
                                   friendly as Kingdom, shown alongside it)
      Status/Players/Scenario   -> "Scenario": int scenario number
      Status/Players/Costume    -> "Costume":  {"Cap":..., "Body":...}
  We deliberately do NOT request Status/Players/Position, Rotation,
  Tagged, GameMode, Capture, Is2D, or IPv4 -- IPv4 in particular would
  leak a player's IP on a public status page, and live position is
  meaningless without a map and would need much tighter polling than
  this 5-minute cron gives us. If a token hasn't been granted one of
  the permissions above, that field is just silently absent from the
  reply (not an error) -- see GetPlayers()/Mutators in
  ApiRequestStatus.cs -- so under-scoped tokens degrade gracefully.
- IMPORTANT (confirmed by capturing a live reply): the response is NOT
  bare JSON. It comes back with a 22-byte binary prefix ahead of the
  payload -- similar in shape to the incoming-packet header above, but
  2 bytes longer, and the exact meaning of those trailing bytes isn't
  confirmed. There's no length prefix on the JSON itself either way;
  read until the socket closes or a short timeout elapses, then find
  the first '{' in the buffer and parse JSON from there rather than
  assuming a fixed offset (more robust to any header-length variance
  across server versions or response sizes).
- Bad requests (malformed JSON, missing Type, unknown Type, bad token)
  count against a per-IP "5 strikes -> blocked until server restart"
  limiter (Server/JsonApi/BlockClients.cs). A well-formed request with
  a valid token and Type="Status" always succeeds and clears the
  counter, so a correctly-built request here can never trip this --
  but fetch_player_count() still fails soft (returns {}) and never
  retries within a run, so a genuine network hiccup can't cascade into
  repeated attempts either.

Player count is opt-in per server: set "jsonapi_enabled": True (and
optionally "max_players") on a server entry below, and put its token
in the JSONAPI_TOKENS repo secret (JSON blob keyed by idx, e.g.
{"0": "SECURETOKEN"}). Servers without this configured are left
exactly as before -- no "players" field is added, and the frontend
already handles that gracefully.

For the richer per-player fields (name/kingdom/stage/scenario/costume)
to show up too, the token also needs these permissions granted on the
server's settings.json (in addition to the base "Status/Players"):
    Status/Players/Name
    Status/Players/Kingdom
    Status/Players/Stage
    Status/Players/Scenario
    Status/Players/Costume
Any subset works -- missing permissions just mean the corresponding
field is silently omitted per-player, not an error.

Server settings for the hover tooltip
--------------------------------------
The hover tooltip on the frontend also shows a few server-wide toggles.
Each is gated by its own "Status/Settings/<Path>" permission (see
GetSettings() in Server/JsonApi/ApiRequestStatus.cs), which echoes back
exactly the nested path requested, e.g. requesting
"Status/Settings/Scenario/MergeEnabled" gets you back
{"Settings":{"Scenario":{"MergeEnabled":true}}}. We ask for/use:
    Status/Settings/Scenario/MergeEnabled  -> "scenario_merge"
    Status/Settings/Shines/Enabled         -> "shine_sync"
    Status/Settings/PersistShines/Enabled  -> "persist_shines"
As with player fields, any subset of these permissions works -- a
missing one just means that key is omitted from settings_info, not an
error.

"CaptureSync" (as labeled on the original smoo.it frontend) is NOT a
real field in this server's settings.json -- there's no such property
anywhere in Settings.cs. Per the site owner, it's really just a rule
of thumb about the SMO Online capture-sync mechanism being unstable
above 8 players, so we compute it here as max_players <= 8 rather than
reading it from the server (only meaningful when max_players is set).
"""
import json
import os
import socket
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone

SERVERS = [
    {"idx": 0, "host": "srdev.bond", "port": 1027, "jsonapi_enabled": True, "max_players": 8},
    {"idx": 1, "host": "90.65.160.139", "port": 1027},
    {"idx": 2, "host": "90.65.160.139", "port": 1028},
    {"idx": 3, "host": "129.213.139.181", "port": 1027},
]

TIMEOUT_SECONDS = 5
ATTEMPTS = 2
RETRY_DELAY_SECONDS = 2

GEO_CACHE_PATH = "geo_cache.json"
GEO_TIMEOUT_SECONDS = 5

JSONAPI_TIMEOUT_SECONDS = 5
JSONAPI_MAX_RESPONSE_BYTES = 65536  # generous cap so a malformed/huge reply can't hang us
# JSON-encoded mapping of {"<idx>": "<token>"}, e.g. {"0": "SECURETOKEN"}.
# Set as a repo secret (Settings -> Secrets and variables -> Actions) and
# passed into the workflow as an env var -- never hardcode tokens here,
# this repo is public.
JSONAPI_TOKENS = json.loads(os.environ.get("JSONAPI_TOKENS") or "{}")


def check_once(host: str, port: int):
    start = time.monotonic()
    try:
        with socket.create_connection((host, port), timeout=TIMEOUT_SECONDS):
            elapsed_ms = round((time.monotonic() - start) * 1000)
            return True, elapsed_ms, None
    except Exception as e:
        return False, None, str(e)


def check_server(server: dict) -> dict:
    host, port = server["host"], server["port"]
    last_error = None
    for attempt in range(1, ATTEMPTS + 1):
        ok, elapsed_ms, err = check_once(host, port)
        if ok:
            return {"idx": server["idx"], "status": "online", "latency_ms": elapsed_ms}
        last_error = err
        if attempt < ATTEMPTS:
            time.sleep(RETRY_DELAY_SECONDS)
    return {"idx": server["idx"], "status": "offline", "error": last_error}


def fetch_player_count(server: dict) -> dict:
    """
    Returns {} if this server has no JSON API configured, or on any
    failure (timeout, disabled feature, bad/missing token, malformed
    reply, etc). A failed lookup should never affect the online/offline
    result -- only call this after check_server() reports "online".

    On success returns at least {"players": <int>}, plus:
      - "max_players" if configured on the server entry below
      - "player_list": one entry per connected player, built from
        whichever of Name/Kingdom/Stage/Scenario/Costume the token's
        permissions actually returned (see the module docstring) --
        each entry only has the keys the server sent back, so a token
        scoped to fewer permissions just yields sparser entries rather
        than an error
      - "settings_info": whichever of scenario_merge/shine_sync/
        persist_shines the token's Status/Settings/* permissions
        returned (see the module docstring), plus "capture_sync" --
        which is NOT read from the server (there's no such field) but
        computed client-side as max_players <= 8, only when
        max_players is configured

    Speaks the raw wire protocol directly (see the module docstring):
    opens its OWN fresh connection (the JSON API request must be the
    first bytes sent on a connection, so this can't reuse the socket
    check_server() already used), sends one JSON API request, and reads
    the reply back (a binary prefix followed by unframed JSON -- see
    the docstring for what's confirmed vs. inferred about that prefix).
    """
    if not server.get("jsonapi_enabled"):
        return {}

    token = JSONAPI_TOKENS.get(str(server["idx"]))
    if not token:
        return {}

    request_obj = {"API_JSON_REQUEST": {"Token": token, "Type": "Status"}}
    request_bytes = json.dumps(request_obj, separators=(",", ":")).encode("utf-8")

    if len(request_bytes) > 512:
        print(f"  player count request too large for idx {server['idx']} (token too long?)")
        return {}

    try:
        with socket.create_connection(
            (server["host"], server["port"]), timeout=JSONAPI_TIMEOUT_SECONDS
        ) as sock:
            sock.settimeout(JSONAPI_TIMEOUT_SECONDS)
            sock.sendall(request_bytes)

            chunks = []
            total = 0
            while total < JSONAPI_MAX_RESPONSE_BYTES:
                chunk = sock.recv(4096)
                if not chunk:
                    break
                chunks.append(chunk)
                total += len(chunk)
            raw = b"".join(chunks)
    except (OSError, socket.timeout) as e:
        print(f"  player count lookup failed for idx {server['idx']}: {e}")
        return {}

    if not raw:
        return {}

    # The reply is not bare JSON: it comes back with a 22-byte binary
    # prefix ahead of the payload (confirmed empirically -- similar in
    # shape to the incoming-packet header the docstring describes, but
    # 2 bytes longer than that 20-byte header; the exact meaning of the
    # trailing fields isn't confirmed). Rather than hardcode an offset
    # that might shift with response size or server version, find the
    # first '{' and parse from there -- robust regardless of exact
    # header length.
    brace_idx = raw.find(b"{")
    if brace_idx == -1:
        print(f"  player count reply had no JSON payload for idx {server['idx']}: {raw!r}")
        return {}

    try:
        data = json.loads(raw[brace_idx:].decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as e:
        print(f"  player count reply unparseable for idx {server['idx']}: {e}")
        return {}

    players = data.get("Players") if isinstance(data, dict) else None
    if not isinstance(players, list):
        print(f"  player count reply missing \"Players\" list for idx {server['idx']}: {data}")
        return {}

    result = {"players": len(players)}
    if "max_players" in server:
        result["max_players"] = server["max_players"]

    player_list = [extract_player_fields(p) for p in players if isinstance(p, dict)]
    # Only include the list if at least one entry actually has a field
    # in it -- if the token wasn't granted any of Name/Kingdom/Stage/
    # Scenario/Costume, every entry would be {} and there's no point
    # shipping an array of empty objects to the frontend.
    if any(player_list):
        result["player_list"] = player_list

    settings_info = extract_settings_fields(data.get("Settings"))
    if "max_players" in server:
        settings_info["capture_sync"] = server["max_players"] <= 8
    if settings_info:
        result["settings_info"] = settings_info

    return result


def extract_player_fields(player: dict) -> dict:
    """
    Pulls out just the per-player fields this site displays, from one
    raw entry of the JSON API's "Players" array. Each key is present
    only if the token had the matching Status/Players/<X> permission
    and the server had a value for it (see the module docstring and
    ApiRequestStatus.cs's Mutators dict/JsonIgnore-when-null behavior),
    so any subset -- including an empty dict -- is valid.
    """
    fields = {}
    if isinstance(player.get("Name"), str):
        fields["name"] = player["Name"]
    if isinstance(player.get("Kingdom"), str):
        fields["kingdom"] = player["Kingdom"]
    if isinstance(player.get("Stage"), str):
        fields["stage"] = player["Stage"]
    if isinstance(player.get("Scenario"), int):
        fields["scenario"] = player["Scenario"]
    costume = player.get("Costume")
    if isinstance(costume, dict):
        cap = costume.get("Cap")
        body = costume.get("Body")
        if isinstance(cap, str) or isinstance(body, str):
            fields["costume"] = {"cap": cap, "body": body}
    return fields


def extract_settings_fields(settings: object) -> dict:
    """
    Pulls out just the server-wide toggles the hover tooltip shows,
    from the raw "Settings" object of a JSON API Status reply. Each
    key is present only if the token had the matching
    Status/Settings/<Path> permission -- see the module docstring for
    exactly which permission maps to which nested path. capture_sync
    is deliberately NOT handled here since it isn't a real server
    setting; it's added by the caller from our own max_players config.
    """
    fields = {}
    if not isinstance(settings, dict):
        return fields

    scenario = settings.get("Scenario")
    if isinstance(scenario, dict) and isinstance(scenario.get("MergeEnabled"), bool):
        fields["scenario_merge"] = scenario["MergeEnabled"]

    shines = settings.get("Shines")
    if isinstance(shines, dict) and isinstance(shines.get("Enabled"), bool):
        fields["shine_sync"] = shines["Enabled"]

    persist_shines = settings.get("PersistShines")
    if isinstance(persist_shines, dict) and isinstance(persist_shines.get("Enabled"), bool):
        fields["persist_shines"] = persist_shines["Enabled"]

    return fields


def load_geo_cache() -> dict:
    if os.path.exists(GEO_CACHE_PATH):
        try:
            with open(GEO_CACHE_PATH) as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def save_geo_cache(cache: dict) -> None:
    with open(GEO_CACHE_PATH, "w") as f:
        json.dump(cache, f, indent=2)


def resolve_host_to_ip(host: str):
    try:
        return socket.gethostbyname(host)
    except OSError:
        return None


def fetch_geo(ip: str):
    url = f"https://ipapi.co/{ip}/json/"
    req = urllib.request.Request(url, headers={"User-Agent": "smoom.bond-status-check/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=GEO_TIMEOUT_SECONDS) as resp:
            data = json.loads(resp.read().decode())
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as e:
        print(f"  geo lookup failed for {ip}: {e}")
        return None
    if data.get("error"):
        print(f"  geo lookup error for {ip}: {data.get('reason')}")
        return None
    return {"country_name": data.get("country_name"), "country_code": data.get("country_code")}


def get_geo_for_host(host: str, cache: dict) -> dict:
    ip = resolve_host_to_ip(host)
    if ip is None:
        return {"country_name": "Unknown", "country_code": None}
    if ip in cache:
        return cache[ip]
    geo = fetch_geo(ip)
    if geo is None:
        geo = {"country_name": "Unknown", "country_code": None}
    cache[ip] = geo
    return geo


def main():
    geo_cache = load_geo_cache()
    results = []
    for s in SERVERS:
        result = check_server(s)
        if result["status"] == "online":
            result.update(fetch_player_count(s))
        geo = get_geo_for_host(s["host"], geo_cache)
        result["country_name"] = geo.get("country_name")
        result["country_code"] = geo.get("country_code")
        results.append(result)

    save_geo_cache(geo_cache)

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "servers": results,
    }
    with open("status.json", "w") as f:
        json.dump(payload, f, indent=2)
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
