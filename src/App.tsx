import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AccessGate } from './features/access/ui/AccessGate'

const AuthenticatedApp = lazy(() => import('./AuthenticatedApp'))

const BusinessPage = lazy(() =>
  import('./features/business/ui/BusinessPage').then((m) => ({ default: m.BusinessPage })),
)

function Loading() {
  return (
    <p role="status" className="min-h-dvh p-4 text-sm text-muted">
      Cargando…
    </p>
  )
}

export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public: shows no contact data, so it sits outside the access gate. */}
        <Route path="/empresa" element={<BusinessPage />} />
        <Route
          path="*"
          element={
            <AccessGate>
              <AuthenticatedApp />
            </AccessGate>
          }
        />
      </Routes>
    </Suspense>
  )
}
