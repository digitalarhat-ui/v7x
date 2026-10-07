import http.server
import os
from urllib.parse import urlparse

TARGET = "/tafseel-matabekh-riyadh-v21/"

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path
        if path in ("/", "/index.html"):
            self.send_response(302)
            self.send_header("Location", TARGET)
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet")
            self.end_headers()
            return
        super().do_GET()

    def end_headers(self):
        self.send_header("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

port = int(os.environ.get("PORT", "8080"))
server = http.server.ThreadingHTTPServer(("0.0.0.0", port), Handler)
server.serve_forever()
