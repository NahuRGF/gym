"""Servidor estatico que imita a GitHub Pages: publica dist/ bajo el prefijo /gym/.

`vite preview` ignora el `base` de Vite y sirve dist en la raiz, asi que no sirve
para verificar las rutas relativas del manifest. Este servidor monta dist en
/gym/ como lo hace GitHub Pages, y no hace fallback a index.html: un archivo
inexistente es 404, igual que en produccion.
"""

import http.server
import os
import socketserver
import sys

DIST = sys.argv[1] if len(sys.argv) > 1 else "dist"
PUERTO = int(sys.argv[2]) if len(sys.argv) > 2 else 4173
PREFIJO = "/gym/"
RAIZ = os.path.abspath(DIST)

TIPOS = {
    ".html": "text/html; charset=utf-8",
    ".webmanifest": "application/manifest+json",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".json": "application/json",
}


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        ruta = self.path.split("?", 1)[0].split("#", 1)[0]

        if ruta == "/gym":
            self.send_response(301)
            self.send_header("Location", PREFIJO)
            self.end_headers()
            return

        if not ruta.startswith(PREFIJO):
            self._404()
            return

        relativa = ruta[len(PREFIJO):]
        if relativa == "":
            relativa = "index.html"

        destino = os.path.abspath(os.path.join(RAIZ, relativa))
        # Ampara contra ../ en la URL saliendo de dist/.
        if destino != RAIZ and not destino.startswith(RAIZ + os.sep):
            self._404()
            return
        if not os.path.isfile(destino):
            self._404()
            return

        with open(destino, "rb") as archivo:
            cuerpo = archivo.read()

        ext = os.path.splitext(destino)[1]
        self.send_response(200)
        self.send_header("Content-Type", TIPOS.get(ext, "application/octet-stream"))
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(cuerpo)

    def _404(self):
        self.send_response(404)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"404")

    def log_message(self, *args):
        pass


# Sin allow_reuse_address: en Windows SO_REUSEADDR deja que un proceso nuevo se
# adjudique un puerto ya ocupado, y el servidor viejo sigue atendiendo requests.
# Eso paso durante las pruebas y hacia que vite preview respondiera por encima.
socketserver.TCPServer.allow_reuse_address = False
with socketserver.TCPServer(("127.0.0.1", PUERTO), Handler) as httpd:
    print(f"sirviendo {os.path.abspath(DIST)} en http://localhost:{PUERTO}{PREFIJO}", flush=True)
    httpd.serve_forever()
