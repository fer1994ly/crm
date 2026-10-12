import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'

const NOTICE = /bloqueando el almacenamiento local/

afterEach(() => {
  vi.restoreAllMocks()
})

describe('App shell', () => {
  it('renders the brand and primary navigation once unlocked', async () => {
    sessionStorage.setItem('tiancy-crm:v1:access-unlocked', '1')
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Tiancy Médica')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Nuevo cliente' })).toHaveAttribute('href', '/clientes/nuevo')
    expect(await screen.findByRole('link', { name: 'Empresa' })).toHaveAttribute('href', '/empresa')
    expect(await screen.findByRole('link', { name: 'Administración' })).toHaveAttribute('href', '/admin')
    expect(await screen.findByRole('heading', { level: 1, name: 'Pipeline comercial' })).toBeInTheDocument()
  })

  it('shows no storage notice inside the authenticated layout when storage works', async () => {
    sessionStorage.setItem('tiancy-crm:v1:access-unlocked', '1')
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { level: 1, name: 'Pipeline comercial' })).toBeInTheDocument()
    expect(screen.queryByText(NOTICE)).not.toBeInTheDocument()
  })

  it('shows the storage notice inside the authenticated layout (not only on the login) when storage is blocked', async () => {
    // Blocked storage also blocks the session flag, so the gate must be unlocked through the UI.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    // Fresh modules: the repository singleton must be built while storage is blocked, as in a real browser.
    vi.resetModules()
    const { App: BlockedApp } = await import('./App')
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <BlockedApp />
      </MemoryRouter>,
    )
    // Login screen carries its own notice; unlock so that notice unmounts.
    expect(screen.getByRole('heading', { level: 1, name: 'Acceso' })).toBeInTheDocument()
    await user.type(screen.getByLabelText('Clave de acceso'), 'tiancy2026')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Pipeline comercial' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1, name: 'Acceso' })).not.toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
    // The only notice left comes from Layout.
    expect(screen.getAllByText(NOTICE)).toHaveLength(1)
  })
})
