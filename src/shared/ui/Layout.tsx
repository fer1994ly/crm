import { NavLink, Outlet } from 'react-router-dom'
import { useAccess } from '../../features/access/ui/AccessContext'

const links = [
  { to: '/', label: 'Pipeline', end: true },
  { to: '/clientes/nuevo', label: 'Nuevo cliente', end: false },
]

export function Layout() {
  const { lock } = useAccess()
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="bg-brand text-white">
        <div className="mx-auto max-w-6xl px-4 pt-3 pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <svg aria-hidden="true" viewBox="0 0 32 32" className="h-7 w-7 shrink-0">
              <rect width="32" height="32" rx="7" fill="#ffffff" />
              <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#6FAE7B" />
            </svg>
            <span className="font-heading text-lg font-bold tracking-tight">Tiancy Médica</span>
          </div>
          <nav aria-label="Principal" className="flex gap-1 -mx-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `min-h-11 inline-flex items-center rounded-md px-3 text-sm font-medium ${
                    isActive ? 'bg-white/20' : 'hover:bg-white/10'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={lock}
              className="min-h-11 inline-flex items-center rounded-md px-3 text-sm font-medium hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <footer className="border-t border-line px-4 py-4 text-center text-xs text-muted">
        Tiancy Médica · Equipo médico para instituciones de salud · Costa Rica
      </footer>
    </div>
  )
}
