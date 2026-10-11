import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './shared/ui/Layout'
import { PipelineBoardPage } from './features/pipeline/ui/PipelineBoardPage'

const ClientDetailPage = lazy(() =>
  import('./features/clients/ui/ClientDetailPage').then((m) => ({ default: m.ClientDetailPage })),
)

const NewClientPage = lazy(() =>
  import('./features/clients/ui/NewClientPage').then((m) => ({ default: m.NewClientPage })),
)

const AdminPage = lazy(() => import('./features/admin/ui/AdminPage').then((m) => ({ default: m.AdminPage })))

function Loading() {
  return (
    <p role="status" className="text-sm text-muted">
      Cargando…
    </p>
  )
}

export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<PipelineBoardPage />} />
          <Route path="clientes/nuevo" element={<NewClientPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="clientes/:id" element={<ClientDetailPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
