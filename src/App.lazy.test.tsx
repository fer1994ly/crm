import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const loaded = vi.hoisted(() => ({ board: false }))

vi.mock('./features/pipeline/ui/PipelineBoardPage', () => {
  loaded.board = true
  return { PipelineBoardPage: () => <h1>Pipeline comercial</h1> }
})

describe('App code splitting behind the access gate', () => {
  it('does not load the board module while the login is shown', async () => {
    sessionStorage.clear()
    const { App } = await import('./App')
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Acceso' })).toBeInTheDocument()
    expect(loaded.board).toBe(false)
  })
})
