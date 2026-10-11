import { Route, Routes } from 'react-router-dom'
import { Layout } from './shared/ui/Layout'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<h1 className="text-2xl text-brand">Pipeline comercial</h1>} />
      </Route>
    </Routes>
  )
}
