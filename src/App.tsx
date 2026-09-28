import { Route, Routes, useLocation } from 'react-router-dom'
import TabBar from './components/TabBar'
import Ajustes from './pages/Ajustes'
import Inicio from './pages/Inicio'
import Rutinas from './pages/Rutinas'
import Sesiones from './pages/Sesiones'
import Socios from './pages/Socios'
import { useGymNombre } from './lib/useConfig'

function Encabezado() {
  const nombre = useGymNombre()

  return (
    <header className="safe-top sticky top-0 z-10 bg-zinc-100/90 backdrop-blur">
      <div className="mx-auto max-w-lg px-4 pt-3 pb-2">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">{nombre}</h1>
      </div>
    </header>
  )
}

export default function App() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-full flex-col">
      <Encabezado />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-2 pb-28">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/socios" element={<Socios />} />
          <Route path="/rutinas" element={<Rutinas />} />
          <Route path="/sesiones" element={<Sesiones />} />
          <Route path="/ajustes" element={<Ajustes />} />
          <Route path="*" element={<Inicio />} />
        </Routes>
      </main>

      <TabBar actual={pathname} />
    </div>
  )
}
