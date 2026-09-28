const RUTAS = [
  { to: '/', label: 'Inicio', icono: 'inicio' },
  { to: '/socios', label: 'Socios', icono: 'socios' },
  { to: '/rutinas', label: 'Rutinas', icono: 'rutinas' },
  { to: '/sesiones', label: 'Sesiones', icono: 'sesiones' },
  { to: '/ajustes', label: 'Ajustes', icono: 'ajustes' },
] as const

function Icono({ nombre }: { nombre: (typeof RUTAS)[number]['icono'] }) {
  const comunes = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (nombre) {
    case 'inicio':
      return (
        <svg {...comunes}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20h14V9.5" />
        </svg>
      )
    case 'socios':
      return (
        <svg {...comunes}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M2.5 20c0-3.6 2.9-5.5 6.5-5.5s6.5 1.9 6.5 5.5" />
          <path d="M17 8.5a2.6 2.6 0 0 1 0 5" />
          <path d="M19 20c0-2.2-.8-3.9-2.2-5" />
        </svg>
      )
    case 'rutinas':
      return (
        <svg {...comunes}>
          <path d="M3 12h2M19 12h2" />
          <rect x="5.5" y="8.5" width="3" height="7" rx="1" />
          <rect x="15.5" y="8.5" width="3" height="7" rx="1" />
          <path d="M8.5 12h7" />
        </svg>
      )
    case 'sesiones':
      return (
        <svg {...comunes}>
          <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
          <path d="M3.5 9.5h17M8 3v3M16 3v3" />
          <path d="M8.5 14.5l2 2 4-4" />
        </svg>
      )
    case 'ajustes':
      return (
        <svg {...comunes}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
        </svg>
      )
  }
}

export default function TabBar({ actual }: { actual: string }) {
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 backdrop-blur"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-lg">
        {RUTAS.map((ruta) => {
          const activo = actual === ruta.to
          return (
            <li key={ruta.to} className="flex-1">
              <a
                href={`#${ruta.to}`}
                aria-current={activo ? 'page' : undefined}
                className={`tap flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] leading-none transition-colors ${
                  activo ? 'text-marca font-semibold' : 'text-zinc-500'
                }`}
              >
                <Icono nombre={ruta.icono} />
                <span>{ruta.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
