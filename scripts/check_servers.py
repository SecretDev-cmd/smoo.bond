#!/usr/bin/env python3
"""
Checks TCP connectivity to a list of game servers and writes the result
to status.json for the static page to consume (avoids browser CORS
issues entirely, since this runs server-side in a GitHub Action).
"""
import json
import socket
import time
from datetime import datetime, timezone

SERVERS = [
    {"idx": 0, "host": "srdev.bond", "port": 1027},
    {"idx": 1, "host": "90.65.160.139", "port": 1027},
    {"idx": 2, "host": "90.65.160.139", "port": 1028},
]

TIMEOUT_SECONDS = 5
ATTEMPTS = 2          # try twice before calling it offline, to dodge one-off blips
RETRY_DELAY_SECONDS = 2


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
            return {
                "idx": server["idx"],
                "status": "online",
                "latency_ms": elapsed_ms,
            }
        last_error = err
        if attempt < ATTEMPTS:
            time.sleep(RETRY_DELAY_SECONDS)

    return {
        "idx": server["idx"],
        "status": "offline",
        "error": last_error,
    }


def main():
    results = [check_server(s) for s in SERVERS]
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "servers": results,
    }
    with open("status.json", "w") as f:
        json.dump(payload, f, indent=2)
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
