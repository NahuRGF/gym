# Gestión de Gimnasio

PWA para administrar un gimnasio desde el iPhone. Los datos viven **solo en el
dispositivo**: no hay servidor, no hay base de datos en la nube y no hay login.
Nadie más que el encargado ve la información.

Se instala como una app (modo standalone) y funciona sin conexión.

## Qué hay hoy

- Inicio con KPIs: socios activos, cuotas vencidas e ingresos del mes.
- Socios, planes y pagos.
- Catálogo de ejercicios y rutinas, con impresión a PDF.
- Sesiones y bitácora de asistencia.
- Reportes.
- Backup y restauración en JSON.
- Ajuste del nombre del gimnasio y estado del almacenamiento.

## Instalarla en el iPhone

1. Abrir <https://nahrgf.github.io/gym/> en Safari.
2. Compartir → **Agregar a pantalla de inicio**.

Queda como un ícono más y abre a pantalla completa, sin barra de navegador.

## Datos y respaldo

Todo se guarda en IndexedDB, en el origen `https://nahrgf.github.io/gym/`.

Dos cosas que conviene saber:

- **Safari borra los datos de una PWA que no se abre durante unos días**, y
  también al desinstalarla. La app pide almacenamiento persistente al iniciar y
  avisa en *Ajustes* si el navegador lo concede, pero aun así conviene respaldar.
- **El respaldo es manual**: en *Ajustes* se descarga un `.json`. Guardalo en
  iCloud Drive o donde prefieras. Es la única copia si el navegador borra todo.

El JSON de respaldo no está cifrado: contiene datos personales de socios.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run lint     # oxlint
npm run build    # tsc + build de producción en dist/
```

### Decisiones que conviene conocer antes de tocar el código

- **`HashRouter`, no `BrowserRouter`.** GitHub Pages sirve archivos estáticos y no
  tiene reglas de rewrite, así que `/socios` daría 404. Con hashes (`#/socios`)
  todo resuelve al mismo `index.html`.
- **`base: '/gym/'` en `vite.config.ts`.** El proyecto se publica bajo un
  subdirectorio, no en la raíz del dominio.
- **`vite-plugin-singlefile`.** Inyecta el JS y el CSS dentro de `index.html` para
  que la app quede en un solo archivo. El manifest, los íconos y el service
  worker siguen siendo archivos aparte, porque el navegador los exige así.
- **El service worker solo cachea el caparazón.** Los datos no pasan por ahí:
  viven en IndexedDB y el service worker no los toca.
- **Rutas relativas en `manifest.webmanifest` y `sw.js`.** Van con `./` para que
  funcionen bajo `/gym/` y no se rompan si el repo se mueve.

## Despliegue

`main` dispara `.github/workflows/deploy.yml`, que compila y publica en GitHub
Pages. Para probar cambios antes de subirlos:

```bash
npm run build
```

## Stack

Vite, React, TypeScript, Tailwind CSS, Dexie (IndexedDB) y `dexie-react-hooks`.
