import { Route, Routes } from 'react-router-dom'
import { Layout } from './shared/ui/Layout'
import { PipelineBoardPage } from './features/pipeline/ui/PipelineBoardPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<PipelineBoardPage />} />
      </Route>
    </Routes>
  )
}
