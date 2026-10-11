import { lazy, Suspense } from 'react'
import { AccessGate } from './features/access/ui/AccessGate'

const AuthenticatedApp = lazy(() => import('./AuthenticatedApp'))

function Loading() {
  return (
    <p role="status" className="min-h-dvh p-4 text-sm text-muted">
      Cargando…
    </p>
  )
}

export function App() {
  return (
    <AccessGate>
      <Suspense fallback={<Loading />}>
        <AuthenticatedApp />
      </Suspense>
    </AccessGate>
  )
}
