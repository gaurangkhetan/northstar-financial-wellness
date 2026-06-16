#!/usr/bin/env python3
"""Minimal static file server for the Northstar Planning demo.

Serves the folder this script lives in on http://127.0.0.1:4173.
Run with:  python3 serve.py
"""
import functools
import http.server
import os
import socketserver

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PORT = 4173

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=DIRECTORY)


class Server(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    with Server(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Serving {DIRECTORY}\n→ open http://127.0.0.1:{PORT}  (Ctrl+C to stop)")
        httpd.serve_forever()
