import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './shared/ui/Layout'

const PipelineBoardPage = lazy(() =>
  import('./features/pipeline/ui/PipelineBoardPage').then((m) => ({ default: m.PipelineBoardPage })),
)

const ClientDetailPage = lazy(() =>
  import('./features/clients/ui/ClientDetailPage').then((m) => ({ default: m.ClientDetailPage })),
)

const NewClientPage = lazy(() =>
  import('./features/clients/ui/NewClientPage').then((m) => ({ default: m.NewClientPage })),
)

/** Everything behind the access gate: loaded only after the password was accepted. */
export default function AuthenticatedApp() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<PipelineBoardPage />} />
        <Route path="clientes/nuevo" element={<NewClientPage />} />
        <Route path="clientes/:id" element={<ClientDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
