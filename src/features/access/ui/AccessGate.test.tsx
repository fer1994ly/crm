import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../../../App'
import { CLIENTS_STORAGE_KEY } from '../../clients/infrastructure/localStorageClientRepository'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

async function unlock(user: ReturnType<typeof userEvent.setup>, password = 'tiancy2026') {
  await user.type(screen.getByLabelText('Clave de acceso'), password)
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
}

describe('AccessGate', () => {
  it.each(['/', '/clientes/nuevo', '/clientes/cli-004', '/admin', '/no-existe'])(
    'shows only the login on %s and never reads the repository',
    (path) => {
      renderAt(path)
      expect(screen.getByRole('heading', { level: 1, name: 'Acceso' })).toBeInTheDocument()
      expect(screen.getByLabelText('Clave de acceso')).toBeInTheDocument()
      expect(screen.queryByText(/Clínica Santa Lucía/)).not.toBeInTheDocument()
      expect(screen.queryByRole('navigation', { name: 'Principal' })).not.toBeInTheDocument()
      expect(localStorage.getItem(CLIENTS_STORAGE_KEY)).toBeNull()
    },
  )

  it('shows the demo password hint', () => {
    renderAt('/')
    expect(screen.getByText('Clave de demostración: tiancy2026')).toBeInTheDocument()
  })

  it('rejects a wrong password with an inline error and stays locked', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await unlock(user, 'equivocada')
    expect(screen.getByRole('alert')).toHaveTextContent('Clave incorrecta.')
    expect(screen.getByLabelText('Clave de acceso')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText(/Clínica Santa Lucía/)).not.toBeInTheDocument()
    expect(localStorage.getItem(CLIENTS_STORAGE_KEY)).toBeNull()
  })

  it('unlocks and lands on the board when / was requested', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await unlock(user)
    expect(await screen.findByRole('heading', { level: 1, name: 'Pipeline comercial' })).toBeInTheDocument()
    expect(sessionStorage.getItem('tiancy-crm:v1:access-unlocked')).toBe('1')
  })

  it('unlocks and lands on the originally requested deep link', async () => {
    const user = userEvent.setup()
    renderAt('/clientes/cli-004')
    await unlock(user)
    expect(await screen.findByRole('heading', { level: 1, name: /Hospital Metropolitano/ })).toBeInTheDocument()
  })

  it('lands on the admin panel when /admin was requested', async () => {
    const user = userEvent.setup()
    renderAt('/admin')
    await unlock(user)
    expect(await screen.findByRole('heading', { level: 1, name: 'Administración' })).toBeInTheDocument()
  })

  it('renders directly when the session is already unlocked', async () => {
    sessionStorage.setItem('tiancy-crm:v1:access-unlocked', '1')
    renderAt('/')
    expect(await screen.findByRole('heading', { level: 1, name: 'Pipeline comercial' })).toBeInTheDocument()
  })

  it('locks again from the account menu and returns to the login', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await unlock(user)
    await screen.findByRole('heading', { level: 1, name: 'Pipeline comercial' })
    await user.click(screen.getByRole('button', { name: 'Cuenta' }))
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Acceso' })).toBeInTheDocument()
    expect(screen.queryByText(/Clínica Santa Lucía/)).not.toBeInTheDocument()
    expect(sessionStorage.getItem('tiancy-crm:v1:access-unlocked')).toBeNull()
  })
})
