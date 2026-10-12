import { Suspense, useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { AccountMenu } from '../../features/access/ui/AccountMenu'

const links = [
  { to: '/', label: 'Pipeline', end: true },
  { to: '/clientes/nuevo', label: 'Nuevo cliente', end: false },
  { to: '/admin', label: 'Administración', end: false },
  { to: '/empresa', label: 'Empresa', end: false },
]

export function Layout() {
  // Bumping the version remounts the page so it reloads the (reset) data.
  const [dataVersion, setDataVersion] = useState(0)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 5000)
    return () => clearTimeout(timer)
  }, [notice])

  function handleDataReset() {
    setDataVersion((version) => version + 1)
    setNotice('Datos de ejemplo restablecidos.')
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="bg-brand text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 px-4 pt-3 pb-2">
          <div className="order-1 flex items-center gap-2">
            <svg aria-hidden="true" viewBox="0 0 32 32" className="h-7 w-7 shrink-0">
              <rect width="32" height="32" rx="7" fill="#ffffff" />
              <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#6FAE7B" />
            </svg>
            <span className="font-heading text-lg font-bold tracking-tight">Tiancy Médica</span>
          </div>
          <nav aria-label="Principal" className="order-3 -mx-2 flex w-full flex-wrap gap-1 sm:order-2 sm:ml-auto sm:w-auto">
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
          </nav>
          <div className="order-2 sm:order-3">
            <AccountMenu onDataReset={handleDataReset} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {notice && (
          <p role="status" className="mb-3 rounded-md bg-accent/25 px-3 py-2 text-sm font-medium text-brand-dark">
            {notice}
          </p>
        )}
        <Suspense
          fallback={
            <p role="status" className="min-h-[60dvh] text-sm text-muted">
              Cargando…
            </p>
          }
        >
          <Outlet key={dataVersion} />
        </Suspense>
      </main>
      <footer className="border-t border-line px-4 py-4 text-center text-xs text-muted">
        Tiancy Médica · Equipo médico para instituciones de salud · Costa Rica
      </footer>
    </div>
  )
}
