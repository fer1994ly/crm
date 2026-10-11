import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AccessGate } from './features/access/ui/AccessGate'
import { Layout } from './shared/ui/Layout'
import { PipelineBoardPage } from './features/pipeline/ui/PipelineBoardPage'

const ClientDetailPage = lazy(() =>
  import('./features/clients/ui/ClientDetailPage').then((m) => ({ default: m.ClientDetailPage })),
)

const NewClientPage = lazy(() =>
  import('./features/clients/ui/NewClientPage').then((m) => ({ default: m.NewClientPage })),
)

function Loading() {
  return (
    <p role="status" className="text-sm text-muted">
      Cargando…
    </p>
  )
}

export function App() {
  return (
    <AccessGate>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<PipelineBoardPage />} />
            <Route path="clientes/nuevo" element={<NewClientPage />} />
            <Route path="clientes/:id" element={<ClientDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </AccessGate>
  )
}
