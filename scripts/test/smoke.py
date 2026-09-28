"""Smoke test de la PWA del gym.

Verifica render, navegacion, IndexedDB, manifest, service worker y que la app
abra sin conexion.

    python scripts/test/smoke.py [url]

Sin argumentos usa un servidor local que emula GitHub Pages bajo /gym/.
Con una URL, prueba contra lo que este desplegado.

Requiere Playwright con Chromium:  pip install playwright && playwright install chromium

El fuente es ASCII puro a proposito: los acentos van como escapes \\uXXXX, para
que ninguna codificacion de consola o de reescritura pueda corromper el test.
"""

import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

LOCAL = "http://localhost:4180/gym/"
REMOTO = "https://nahurgf.github.io/gym/"

NO_SOCIOS = "Todav\u00eda no hay socios"
CATALOGO = "Cat\u00e1logo y rutinas"
BITACORA = "Sesiones y bit\u00e1cora"
AL_DIA = "todo al d\u00eda"

fallos = []


def servidor_local():
    """Levanta serve_pages.py sobre dist/ y devuelve el proceso."""
    raiz = Path(__file__).resolve().parents[2]
    # shell=True porque en Windows npm es npm.cmd, no un ejecutable.
    subprocess.run("npm run build", cwd=raiz, shell=True, check=True)
    proc = subprocess.Popen(
        [sys.executable, str(Path(__file__).parent / "serve_pages.py"), str(raiz / "dist"), "4180"]
    )
    for _ in range(40):
        try:
            urllib.request.urlopen(LOCAL, timeout=1)
            return proc
        except (urllib.error.URLError, ConnectionError, OSError):
            time.sleep(0.5)
    proc.terminate()
    sys.exit("El servidor local no levanto en el puerto 4180")


if len(sys.argv) > 1:
    BASE = sys.argv[1]
    propio = None
else:
    BASE = LOCAL
    propio = servidor_local()

print(f"Probando contra: {BASE}")


def check(nombre, condicion, detalle=""):
    marca = "OK   " if condicion else "FALLA"
    sufijo = f" -> {detalle}" if detalle else ""
    print(f"  [{marca}] {nombre}{sufijo}")
    if not condicion:
        fallos.append(nombre)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})

    errores = []
    page.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errores.append(str(e)))

    print("\n== Carga inicial ==")
    r = page.goto(BASE, wait_until="networkidle")
    check("index.html responde 200", r is not None and r.status == 200,
          f"status={r.status if r else 'sin respuesta'}")
    check("sin scripts externos", page.locator("script[src]").count() == 0,
          f"externos={page.locator('script[src]').count()}")
    check("CSS inline (singlefile)", page.evaluate("!!document.querySelector('style')"))

    print("\n== Render ==")
    check("titulo del gimnasio", page.locator("h1").inner_text().strip() == "Mi Gimnasio",
          page.locator("h1").inner_text().strip())
    for etiqueta in ("Socios activos", "Cuotas vencidas", "Ingresos del mes"):
        check(f"KPI '{etiqueta}'", page.get_by_text(etiqueta).count() > 0)
    check("estado vacio visible", page.get_by_text(NO_SOCIOS).count() > 0)

    print("\n== Navegacion por tabs ==")
    for etiqueta, esperado in [
        ("Socios", "Socios, planes y pagos"),
        ("Rutinas", CATALOGO),
        ("Sesiones", BITACORA),
        ("Ajustes", "Almacenamiento"),
    ]:
        page.get_by_role("link", name=etiqueta).click()
        page.wait_for_timeout(250)
        check(f"tab {etiqueta}", page.get_by_text(esperado).count() > 0,
              f"hash={page.evaluate('location.hash')}")

    print("\n== IndexedDB: escritura cruda y relectura ==")
    bases = page.evaluate("indexedDB.databases().then(l => l.map(b => b.name))")
    check("base 'gym' creada", "gym" in bases, str(bases))

    fila = page.evaluate("""async () => {
        const db = await new Promise((res, rej) => {
            const q = indexedDB.open('gym')
            q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error)
        })
        await new Promise((res, rej) => {
            const tx = db.transaction('socios', 'readwrite')
            tx.objectStore('socios').put({
                id: 'test-1', nombre: 'Socio de Prueba', documento: '', telefono: '',
                email: '', fechaAlta: '2026-01-15', estado: 'activo',
                planId: null, vence: '2027-02-15', notas: ''
            })
            tx.oncomplete = res; tx.onerror = () => rej(tx.error)
        })
        return new Promise((res, rej) => {
            const q = db.transaction('socios', 'readonly').objectStore('socios').get('test-1')
            q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error)
        })
    }""")
    check("socio insertado y releido", bool(fila) and fila.get("nombre") == "Socio de Prueba",
          fila.get("nombre") if fila else "null")

    print("\n== Las consultas de la app leen la base ==")
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(700)
    # inner_text() devuelve el texto ya transformado por CSS, y las etiquetas de los
    # KPI van en uppercase, por eso se compara en minusculas.
    bajo = page.locator("main").inner_text().lower()
    check("socios activos = 1",
          "socios activos" in bajo and bajo.split("socios activos")[1].strip().startswith("1"),
          repr(bajo.split("socios activos")[1].strip()[:6]) if "socios activos" in bajo else "no aparece")
    check("sin cuotas vencidas", AL_DIA in bajo)
    check("ya no pide cargar socios", page.get_by_text(NO_SOCIOS).count() == 0)

    print("\n== Reactividad de useLiveQuery (escritura via la UI) ==")
    page.get_by_role("link", name="Ajustes").click()
    page.wait_for_timeout(300)
    page.get_by_label("Nombre del gimnasio").fill("Gimnasio Test")
    page.get_by_role("button", name="Guardar").click()
    page.wait_for_timeout(600)
    check("el encabezado se actualiza sin recargar",
          page.locator("h1").inner_text().strip() == "Gimnasio Test",
          page.locator("h1").inner_text().strip())
    page.get_by_role("link", name="Inicio").click()
    page.wait_for_timeout(300)
    check("el valor persistio tras navegar",
          page.locator("h1").inner_text().strip() == "Gimnasio Test",
          page.locator("h1").inner_text().strip())

    print("\n== PWA ==")
    href = page.evaluate("document.querySelector('link[rel=manifest]')?.getAttribute('href')")
    check("manifest enlazado", href is not None, str(href))
    tipo = page.evaluate("async (h) => (await fetch(h)).headers.get('content-type')", href)
    check("manifest con content-type correcto", "manifest" in (tipo or ""), str(tipo))
    resp = page.evaluate("async (h) => (await fetch(h)).json()", href)
    check('display == "standalone"', resp.get("display") == "standalone", str(resp.get("display")))
    check("theme-color presente", bool(resp.get("theme_color")), str(resp.get("theme_color")))
    check("start_url relativo", resp.get("start_url", "").startswith("."),
          str(resp.get("start_url")))
    check("3 iconos declarados", len(resp.get("icons", [])) == 3,
          f"{len(resp.get('icons', []))}")
    for icono in resp.get("icons", []):
        src = icono["src"].lstrip("./")
        # Relativo a /gym/, que es la base del documento durante toda la corrida.
        estado = page.evaluate("async (u) => (await fetch(u)).status", f"./{src}")
        check(f"icono accesible {src}", estado == 200, f"status={estado}")
    sw_estado = page.evaluate("fetch('./sw.js').then(r => r.status)")
    check("sw.js accesible", sw_estado == 200, f"status={sw_estado}")
    viewport = page.evaluate("document.querySelector('meta[name=viewport]')?.content ?? ''")
    check("viewport-fit=cover", "viewport-fit=cover" in viewport)
    apple = page.evaluate("document.querySelector('meta[name=apple-mobile-web-app-capable]')?.content")
    check("apple-mobile-web-app-capable", apple == "yes", str(apple))
    check("lang es-AR", page.evaluate("document.documentElement.lang") == "es-AR",
          str(page.evaluate("document.documentElement.lang")))

    print("\n== Service worker y modo offline ==")
    page.wait_for_timeout(1500)
    registrado = page.evaluate("navigator.serviceWorker.getRegistration().then(r => !!r)")
    check("service worker registrado", registrado is True, str(registrado))
    llenado = page.evaluate("""async () => {
        const c = await caches.open('gym-shell-v2')
        return (await c.keys()).map(k => new URL(k.url).pathname)
    }""")
    check("cache del shell poblado", len(llenado) >= 4, str(llenado))
    check("index.html en cache", any(x.endswith("/gym/index.html") for x in llenado), str(llenado))

    page.context.set_offline(True)
    page.reload(wait_until="domcontentloaded")
    page.wait_for_timeout(2000)
    check("la app abre sin conexion", page.locator("h1").count() > 0,
          page.locator("h1").inner_text().strip() if page.locator("h1").count() else "sin h1")
    check("datos disponibles offline", page.get_by_text("Socios activos").count() > 0)
    check("config disponible offline", page.locator("h1").inner_text().strip() == "Gimnasio Test",
          page.locator("h1").inner_text().strip())
    manifest_offline = page.evaluate("""async (h) => {
        const r = await fetch(h)
        return r.headers.get('content-type')
    }""", href)
    check("manifest disponible offline", "manifest" in (manifest_offline or ""),
          str(manifest_offline))
    page.context.set_offline(False)

    print("\n== Consola ==")
    check("sin errores de consola", len(errores) == 0, "; ".join(errores[:4]) or "ninguno")

    page.screenshot(path=str(Path(__file__).parent / "captura.png"), full_page=True)
    browser.close()

if propio is not None:
    propio.terminate()
    propio.wait(timeout=10)

print("\n" + "=" * 54)
if fallos:
    print(f"FALLARON {len(fallos)}: {fallos}")
    sys.exit(1)
print("TODAS LAS COMPROBACIONES PASARON")
