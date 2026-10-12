import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'

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

  it('shows the storage notice inside the app layout only when storage is blocked', async () => {
    sessionStorage.setItem('tiancy-crm:v1:access-unlocked', '1')
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { level: 1, name: 'Pipeline comercial' })
    expect(screen.queryByText(/bloqueando el almacenamiento local/)).not.toBeInTheDocument()
    unmount()

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(await screen.findByText(/bloqueando el almacenamiento local/)).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
